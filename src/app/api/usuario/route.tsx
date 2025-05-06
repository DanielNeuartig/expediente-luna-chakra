import { NextResponse } from 'next/server'
import { MENSAJES } from '@/lib/validadores'
import { verificarTokenYRolEnDB } from '@/lib/autenticacion/verificarTokenYRolEnDB' // ✅ nuevo helper

export async function GET(req: Request) {
  const token = req.headers.get('authorization')?.split(' ')[1]

  try {
    const usuario = await verificarTokenYRolEnDB(token)

    return NextResponse.json({
      usuario: {
        id: usuario.id,
        rol: usuario.rol,
        correo: usuario.correo,
        propietarioId: usuario.propietarioId,
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || MENSAJES.tokenInvalido },
      { status: 401 }
    )
  }
}