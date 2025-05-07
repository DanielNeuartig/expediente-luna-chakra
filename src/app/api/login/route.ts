import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { validarEmail, MENSAJES } from '@/lib/validadores'

export async function POST(req: Request) {
  try {
    const { correo, contrasena } = await req.json()

    if (!correo || !contrasena) {
      return NextResponse.json({ error: MENSAJES.camposIncompletos }, { status: 400 })
    }

    if (!validarEmail(correo)) {
      return NextResponse.json({ error: MENSAJES.emailInvalido }, { status: 400 })
    }

    const usuario = await prisma.usuario.findUnique({
      where: { correo },
      select: {
        id: true,
        rol: true,
        contraseña: true,
        activo: true,
        correo: true,
        propietarioId: true,
      },
    })

    if (!usuario) {
      return NextResponse.json({ error: MENSAJES.usuarioNoExiste }, { status: 404 })
    }

    if (!usuario.activo) {
      return NextResponse.json({ error: MENSAJES.usuarioInactivo }, { status: 403 })
    }

    const esValido = await bcrypt.compare(contrasena, usuario.contraseña)

    if (!esValido) {
      return NextResponse.json({ error: MENSAJES.contrasenaIncorrecta }, { status: 401 })
    }

    // Registrar IP del acceso
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'IP_DESCONOCIDA'

      await prisma.acceso.create({
        data: {
          usuarioId: usuario.id,
          ip: ip.toString(),
          tipoAcceso: 'LOGIN',
        },
      })

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    )

    return NextResponse.json({
      token,
      usuario: {
        id: usuario.id,
        rol: usuario.rol,
        propietarioId: usuario.propietarioId,
        correo: usuario.correo,
      },
    })
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error en /api/login:', error)
    }
    return NextResponse.json({ error: MENSAJES.errorInterno }, { status: 500 })
  }
}