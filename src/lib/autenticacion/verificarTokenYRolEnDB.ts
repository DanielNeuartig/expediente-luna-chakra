import { prisma } from '@/lib/prisma'
import { MENSAJES } from '@/lib/validadores'
import jwt from 'jsonwebtoken'

type Payload = {
  id: number
  rol: string
}

export async function verificarTokenYRolEnDB(token?: string) {
  if (!token) {
    throw new Error(MENSAJES.tokenFaltante)
  }

  let decoded: Payload
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as Payload
  } catch {
    throw new Error(MENSAJES.tokenInvalido)
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: decoded.id },
    select: {
      id: true,
      rol: true,
      activo: true,
      correo: true,             // ← Añadir
      propietarioId: true,      //
    },
  })

  if (!usuario) {
    throw new Error(MENSAJES.usuarioNoExiste)
  }

  if (!usuario.activo) {
    throw new Error(MENSAJES.usuarioInactivo)
  }

  if (usuario.rol !== decoded.rol) {
    throw new Error('ROL_CAMBIADO')
  }

  return usuario
}