import { NextResponse } from 'next/server'
import { MENSAJES } from '@/lib/validadores'
import { verificarTokenYRolEnDB } from '@/lib/autenticacion/verificarTokenYRolEnDB'
import { extraerToken } from '@/lib/autenticacion/extraerToken'
import { prisma } from '@/lib/prisma'
import { TipoAcceso } from '@prisma/client'

const IP_DESCONOCIDA = '0.0.0.0'

export async function GET(req: Request) {
  const token = extraerToken(req)
  if (!token) {
    return NextResponse.json({ error: MENSAJES.tokenFaltante }, { status: 401 })
  }

  try {
    const usuario = await verificarTokenYRolEnDB(token)

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || IP_DESCONOCIDA
    const userAgent = req.headers.get('user-agent') || 'NAVEGADOR_DESCONOCIDO'

    await prisma.acceso.create({
      data: {
        usuarioId: usuario.id,
        ip,
        userAgent,
        tipoAcceso: TipoAcceso.GET_USUARIO_ACTUAL,
      },
    })

    return NextResponse.json({
      usuario: {
        id: usuario.id,
        rol: usuario.rol,
        correo: usuario.correo,
        propietarioId: usuario.propietarioId,
      },
    })
  } catch (err: any) {
    const mensaje = err.message === 'USUARIO_NO_ENCONTRADO'
      ? MENSAJES.usuarioNoExiste
      : MENSAJES.tokenInvalido

    return NextResponse.json({ error: mensaje }, { status: 401 })
  }
}