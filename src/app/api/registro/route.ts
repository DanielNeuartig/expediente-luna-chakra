import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { validarEmail, MENSAJES } from '@/lib/validadores'
import { ROLES_PERMITIDOS } from '@/lib/constantes'

export async function POST(req: Request) {
  try {
    const { correo, contrasena, rol } = await req.json()

    if (!correo || !contrasena || !rol) {
      return NextResponse.json({ error: MENSAJES.camposIncompletos }, { status: 400 })
    }

    if (!validarEmail(correo)) {
      return NextResponse.json({ error: MENSAJES.emailInvalido }, { status: 400 })
    }

    if (contrasena.length < 8) {
      return NextResponse.json({ error: MENSAJES.contrasenaCorta }, { status: 400 })
    }

    if (!ROLES_PERMITIDOS.includes(rol)) {
      return NextResponse.json({ error: MENSAJES.rolInvalido }, { status: 400 })
    }

    const existente = await prisma.usuario.findUnique({ where: { correo } })

    if (existente) {
      return NextResponse.json({ error: MENSAJES.correoDuplicado }, { status: 409 })
    }

    const hash = await bcrypt.hash(contrasena, 10)

    // Registrar IP del acceso
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'IP_DESCONOCIDA'

      const nuevoUsuario = await prisma.usuario.create({
        data: {
          correo,
          contraseña: hash,
          rol,
          activo: true,
          accesos: {
            create: {
              ip: ip.toString(),
              tipoAcceso: 'REGISTRO',
            },
          },
        },
      })

    return NextResponse.json({ mensaje: MENSAJES.registroExitoso, usuarioId: nuevoUsuario.id })
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error en /api/registro:', error)
    }
    return NextResponse.json({ error: MENSAJES.errorInterno }, { status: 500 })
  }
}