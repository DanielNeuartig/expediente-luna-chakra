import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const telefono = searchParams.get('telefono')?.trim()

  if (!telefono || !/^\+\d{10,15}$/.test(telefono)) {
    return NextResponse.json({ error: 'Teléfono inválido' }, { status: 400 })
  }

  // 🔐 Obtener IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '0.0.0.0'
  const haceCincoMin = new Date(Date.now() - 5 * 60 * 1000)

  // 📉 Limitar por IP
  const intentos = await prisma.acceso.count({
    where: {
      ip,
      tipoAcceso: 'SMS_DISPONIBILIDAD',
      fecha: { gte: haceCincoMin },
    },
  })

  if (intentos >= 10) {
    return NextResponse.json({
      error: 'Demasiadas consultas desde esta IP. Intenta más tarde.',
    }, { status: 429 })
  }

  // 📝 Registrar el acceso sin usuario
  await prisma.acceso.create({
    data: {
      ip,
      tipoAcceso: 'SMS_DISPONIBILIDAD',
      usuarioId: null,
    },
  })

  const yaRegistrado = await prisma.propietario.findFirst({
    where: {
      telefonoPrincipal: telefono,
    },
    select: { id: true },
  })

  return NextResponse.json({ disponible: !yaRegistrado })
}