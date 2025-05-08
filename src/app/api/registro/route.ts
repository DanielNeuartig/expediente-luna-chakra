import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { MENSAJES } from '@/lib/validadores'
import { Rol, TipoAcceso } from '@prisma/client'

const ROLES_VALIDOS: Rol[] = ['MEDICO', 'AUXILIAR', 'PROPIETARIO']

export async function POST(req: Request) {
  try {
    const { correo, contrasena, confirmar, rol } = await req.json()

    if (!correo || !contrasena || !confirmar || !rol) {
      return NextResponse.json({ error: MENSAJES.camposIncompletos }, { status: 400 })
    }

    const correoNormalizado = correo.trim().toLowerCase()


    if (contrasena.length < 8) {
      return NextResponse.json({ error: MENSAJES.contrasenaCorta }, { status: 400 })
    }

    if (contrasena !== confirmar) {
      return NextResponse.json({ error: MENSAJES.contrasenasNoCoinciden }, { status: 400 })
    }

    if (typeof rol !== 'string' || !ROLES_VALIDOS.includes(rol as Rol)) {
      return NextResponse.json({ error: MENSAJES.rolInvalido }, { status: 400 })
    }

    const rolFinal = rol as Rol

    const existente = await prisma.usuario.findUnique({ where: { correo: correoNormalizado } })
    if (existente) {
      return NextResponse.json({ error: MENSAJES.usuarioYaExiste }, { status: 409 })
    }

    const hash = await bcrypt.hash(contrasena, 10)

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '0.0.0.0'
    const userAgent = req.headers.get('user-agent') || 'NAVEGADOR_DESCONOCIDO'

    const nuevo = await prisma.$transaction(async (tx) => {
      const creado = await tx.usuario.create({
        data: {
          correo: correoNormalizado,
          contraseña: hash,
          rol: rolFinal,
        },
      })

      await tx.acceso.create({
        data: {
          usuarioId: creado.id,
          ip,
          userAgent,
          tipoAcceso: TipoAcceso.REGISTRO,
        },
      })

      return creado
    })

    return NextResponse.json({ mensaje: MENSAJES.registroExitoso, usuarioId: nuevo.id })
  } catch (err) {
    console.error('❌ Error en registro:', err)
    return NextResponse.json({ error: MENSAJES.errorInterno }, { status: 500 })
  }
}