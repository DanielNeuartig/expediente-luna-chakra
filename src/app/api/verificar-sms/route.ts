import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MENSAJES } from '@/lib/validadores'
import { verificarTokenYRolEnDB } from '@/lib/autenticacion/verificarTokenYRolEnDB'

const MAX_INTENTOS = 5

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

  const { telefono, codigo } = await req.json()
  const tel = telefono?.trim()
  const code = codigo?.trim()

  if (!tel || !code) {
    return NextResponse.json({ error: MENSAJES.camposIncompletos }, { status: 400 })
  }

  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: 'Formato de código inválido' }, { status: 400 })
  }

  const verificacion = await prisma.verificacionSMS.findFirst({
    where: {
      usuarioId: usuario.id,
      telefono: tel,
      usado: false,
      expiradoEn: { gt: new Date() },
    },
    orderBy: { creadoEn: 'desc' },
  })

  if (!verificacion) {
    return NextResponse.json({ error: 'Código inválido o expirado' }, { status: 404 })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '0.0.0.0'
  const haceCincoMin = new Date(Date.now() - 5 * 60 * 1000)
const intentosDesdeIP = await prisma.acceso.count({
  where: {
    usuarioId: usuario.id,
    ip,
    tipoAcceso: 'SMS_VERIFICACION',
    fecha: { gte: haceCincoMin },
  },
})

if (intentosDesdeIP >= 5) {
  return NextResponse.json({
    error: 'Demasiados intentos de verificación desde esta IP. Intenta más tarde.',
  }, { status: 429 })
}

  if ((verificacion.intentosFallidos ?? 0) >= MAX_INTENTOS) {
    return NextResponse.json({ error: 'Demasiados intentos fallidos' }, { status: 429 })
  }

  if (verificacion.codigo !== code) {
    await prisma.verificacionSMS.update({
      where: { id: verificacion.id },
      data: { intentosFallidos: { increment: 1 } },
    })

    await prisma.acceso.create({
      data: {
        usuarioId: usuario.id,
        ip,
        tipoAcceso: 'SMS_VERIFICACION',
      },
    })

    return NextResponse.json({ error: 'Código incorrecto' }, { status: 401 })
  }

  await prisma.$transaction([
    prisma.verificacionSMS.update({
      where: { id: verificacion.id },
      data: { usado: true },
    }),
    prisma.acceso.create({
      data: {
        usuarioId: usuario.id,
        ip,
        tipoAcceso: 'SMS_VERIFICACION',
      },
    }),
  ])

  return NextResponse.json(
    { success: true, mensaje: 'Código verificado correctamente' },
    { status: 200 }
  )
}