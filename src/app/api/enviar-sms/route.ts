import { NextResponse } from 'next/server'
import { MENSAJES } from '@/lib/validadores'
import { verificarTokenYRolEnDB } from '@/lib/autenticacion/verificarTokenYRolEnDB'
import { Twilio } from 'twilio'
import { prisma } from '@/lib/prisma'

const twilio = new Twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

export async function POST(req: Request) {
  const token = req.headers.get('authorization')?.split(' ')[1]
  if (!token) {
    return NextResponse.json({ error: MENSAJES.tokenFaltante }, { status: 401 })
  }

  let usuario
  try {
    usuario = await verificarTokenYRolEnDB(token)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 })
  }

  // 🔐 Obtener IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '0.0.0.0'

  // 📉 Limitar: máximo 3 intentos en 5 minutos desde la misma IP
  const haceCincoMin = new Date(Date.now() - 5 * 60 * 1000)
  const intentos = await prisma.acceso.count({
    where: {
      usuarioId: usuario.id,
      ip,
      fecha: { gte: haceCincoMin },
      tipoAcceso: 'SMS_ENVIO',
    },
  })

  if (intentos >= 3) {
    return NextResponse.json({
      error: 'Demasiadas solicitudes desde esta IP. Intenta más tarde.',
    }, { status: 429 })
  }

  // 📝 Registrar el intento inmediatamente
  await prisma.acceso.create({
    data: {
      usuarioId: usuario.id,
      ip,
      tipoAcceso: 'SMS_ENVIO',
    },
  })

  // ✅ Ahora sí: procesar y validar el teléfono
  const { telefono } = await req.json()
  const telFormateado = telefono?.trim()

  if (!telFormateado || !/^\+\d{10,15}$/.test(telFormateado)) {
    return NextResponse.json({
      error: 'Teléfono inválido. Usa formato internacional, por ejemplo: +521234567890.',
    }, { status: 400 })
  }

  const yaRegistrado = await prisma.propietario.findFirst({
    where: {
      telefonoPrincipal: telFormateado,
      usuarioId: { not: usuario.id },
    },
    select: { id: true },
  })

  if (yaRegistrado) {
    return NextResponse.json({
      error: 'Este teléfono ya está registrado como principal por otro propietario',
    }, { status: 409 })
  }

  const vigente = await prisma.verificacionSMS.findFirst({
    where: {
      usuarioId: usuario.id,
      telefono: telFormateado,
      usado: false,
      expiradoEn: { gt: new Date() },
    },
    orderBy: { creadoEn: 'desc' },
  })

  if (vigente) {
    return NextResponse.json({
      success: true,
      mensaje: 'Ya se envió un código recientemente',
    })
  }

  try {
    const codigo = Math.floor(100000 + Math.random() * 900000).toString()
    const expiradoEn = new Date(Date.now() + 5 * 60 * 1000)

    await prisma.verificacionSMS.create({
      data: {
        telefono: telFormateado,
        codigo,
        expiradoEn,
        usuarioId: usuario.id,
      },
    })

    const mensaje = await twilio.messages.create({
      to: telFormateado,
      from: process.env.TWILIO_PHONE_NUMBER!,
      body: `Tu código de verificación es: ${codigo}`,
    })

    return NextResponse.json({ success: true, sid: mensaje.sid })
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error al enviar SMS:', error)
    }
    return NextResponse.json({ error: 'No se pudo enviar el SMS' }, { status: 500 })
  }
}