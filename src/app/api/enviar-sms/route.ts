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

  const { telefono } = await req.json()

  if (!telefono || !/^\+\d{10,15}$/.test(telefono)) {
    return NextResponse.json(
      { error: 'Teléfono inválido. Usa formato internacional, por ejemplo: +521234567890.' },
      { status: 400 }
    )
  }

  try {
    // 1. Generar código
    const codigo = Math.floor(100000 + Math.random() * 900000).toString()
    const expiradoEn = new Date(Date.now() + 5 * 60 * 1000)

    // 2. Guardar en BD
    await prisma.verificacionSMS.create({
      data: {
        telefono,
        codigo,
        expiradoEn,
        usuarioId: usuario.id,
      },
    })

    // 3. Enviar SMS
    const mensaje = await twilio.messages.create({
      to: telefono,
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



