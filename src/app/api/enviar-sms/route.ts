import { NextResponse } from 'next/server'
import { MENSAJES } from '@/lib/validadores'
import { verificarTokenYRolEnDB } from '@/lib/autenticacion/verificarTokenYRolEnDB'
import { extraerToken } from '@/lib/autenticacion/extraerToken'
import { prisma } from '@/lib/prisma'
import { TipoAcceso } from '@prisma/client'
import { Twilio } from 'twilio'

const twilio = new Twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

const MAX_INTENTOS = 3
const TIEMPO_BLOQUEO_MS = 5 * 60 * 1000
const IP_DESCONOCIDA = '0.0.0.0'

function extraerParteLocal(numero: string): string {
  const match = numero.match(/^\+(\d{1,4})(\d{10})$/)
  return match?.[2] || ''
}

function esTelefonoValido(numero: string): boolean {
  const limpio = numero.trim().replace(/[^+\d]/g, '')
  const parteLocal = extraerParteLocal(limpio)
  return /^\+\d{10,15}$/.test(limpio) && /^\d{10}$/.test(parteLocal)
}

export async function POST(req: Request) {
  const token = extraerToken(req)
  if (!token?.trim()) {
    return NextResponse.json({ error: MENSAJES.tokenFaltante }, { status: 401 })
  }

  let usuario
  try {
    usuario = await verificarTokenYRolEnDB(token)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 })
  }

  if (usuario.propietarioId) {
    return NextResponse.json({ error: MENSAJES.yaTienePropietario }, { status: 409 })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || IP_DESCONOCIDA
  const userAgent = req.headers.get('user-agent') || 'NAVEGADOR_DESCONOCIDO'
  const haceCincoMin = new Date(Date.now() - TIEMPO_BLOQUEO_MS)

  const intentos = await prisma.acceso.count({
    where: {
      usuarioId: usuario.id,
      ip,
      fecha: { gte: haceCincoMin },
      tipoAcceso: TipoAcceso.SMS_ENVIO,
    },
  })

  if (intentos >= MAX_INTENTOS) {
    return NextResponse.json({ error: MENSAJES.demasiadosIntentos }, { status: 429 })
  }

  const { telefono } = await req.json()
  if (typeof telefono !== 'string') {
    return NextResponse.json({ error: MENSAJES.telefonoInvalido }, { status: 400 })
  }
  console.log('🟡 [ENVIAR SMS] Teléfono recibido:', telefono)
  const telFormateado = telefono.trim().replace(/[^+\d]/g, '')
  console.log('🟡 [ENVIAR SMS] Teléfono formateado:', telFormateado)
  const parteLocal = extraerParteLocal(telFormateado)

  console.log('📥 Teléfono recibido del frontend:', telefono)
  console.log('📞 Teléfono formateado:', telFormateado)
  console.log('🔍 Parte local sin clave:', parteLocal)

  if (!esTelefonoValido(telFormateado)) {
    console.log('⛔ Teléfono no pasó validación:', telFormateado)
    return NextResponse.json({ error: MENSAJES.telefonoInvalido }, { status: 400 })
  }

  const yaRegistrado = await prisma.propietario.findFirst({
    where: {
      telefonoPrincipal: telFormateado,
      usuarioId: { not: usuario.id },
    },
    select: { id: true },
  })

  if (yaRegistrado) {
    return NextResponse.json({ error: MENSAJES.telefonoYaRegistrado }, { status: 409 })
  }

  try {
    console.log('📤 Enviando a Twilio:', telFormateado)
    const response = await twilio.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verifications.create({
        to: telFormateado,
        channel: 'sms',
      })

    await prisma.acceso.create({
      data: {
        usuarioId: usuario.id,
        ip,
        tipoAcceso: TipoAcceso.SMS_ENVIO,
        detalle: response.sid,
        userAgent,
      },
    })

    return NextResponse.json({ success: true, sid: response.sid })
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('❌ Error al enviar SMS con Twilio:', error?.message)
    }
    return NextResponse.json({ error: MENSAJES.falloEnvioSMS }, { status: 500 })
  }
}