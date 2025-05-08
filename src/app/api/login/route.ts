import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { MENSAJES, esTelefonoValido } from '@/lib/validadores'
import { TipoAcceso } from '@prisma/client'

export async function POST(req: Request) {
  try {
    const { correo, contrasena } = await req.json()
    console.log('📥 Datos recibidos en /api/login:', { correo, contrasena })

    if (!correo || !contrasena) {
      return NextResponse.json({ error: MENSAJES.camposIncompletos }, { status: 400 })
    }

    const identificador = correo.trim().toLowerCase()

    const usuario = await prisma.usuario.findFirst({
      where: {
        OR: [
          { correo: identificador },
          { propietario: { telefonoPrincipal: identificador } },
        ],
      },
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

    if (identificador.startsWith('+') && !esTelefonoValido(identificador)) {
      return NextResponse.json({ error: MENSAJES.telefonoInvalido }, { status: 400 })
    }

    const esValido = await bcrypt.compare(contrasena, usuario.contraseña)
    if (!esValido) {
      return NextResponse.json({ error: MENSAJES.contrasenaIncorrecta }, { status: 401 })
    }

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'IP_DESCONOCIDA'
    const userAgent = req.headers.get('user-agent') || 'NAVEGADOR_DESCONOCIDO'

    await prisma.acceso.create({
      data: {
        usuarioId: usuario.id,
        ip,
        userAgent,
        tipoAcceso: TipoAcceso.LOGIN,
      },
    })

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET ?? 'SECRET',
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