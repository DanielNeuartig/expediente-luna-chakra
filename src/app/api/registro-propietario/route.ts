import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MENSAJES } from '@/lib/validadores'
import { verificarTokenYRolEnDB } from '@/lib/autenticacion/verificarTokenYRolEnDB'

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

  const {
    nombre,
    telefonoPrincipal,
    telefonoSecundario1 = null,
    telefonoSecundario2 = null,
  } = await req.json()

  if (!nombre || !telefonoPrincipal) {
    return NextResponse.json({ error: MENSAJES.camposIncompletos }, { status: 400 })
  }

  const palabras = nombre.trim().split(/\s+/)
  if (palabras.length < 2) {
    return NextResponse.json({ error: 'El nombre debe contener al menos dos palabras' }, { status: 400 })
  }

  const telPrincipal = telefonoPrincipal.trim()
  const telSec1 = telefonoSecundario1?.replace(/\D/g, '') || null
  const telSec2 = telefonoSecundario2?.replace(/\D/g, '') || null

  if (!/^\+\d{10,15}$/.test(telPrincipal)) {
    return NextResponse.json({ error: 'Teléfono principal inválido' }, { status: 400 })
  }

  if ((telSec1 && telSec1.length !== 10) || (telSec2 && telSec2.length !== 10)) {
    return NextResponse.json({ error: 'Teléfonos secundarios inválidos' }, { status: 400 })
  }

  const telPrincipalSinPrefijo = telPrincipal.replace(/^\+\d{1,4}/, '')
  const secundarios = [telSec1, telSec2].filter(Boolean)

  if (secundarios.includes(telPrincipalSinPrefijo)) {
    return NextResponse.json({ error: 'Un teléfono secundario no puede ser igual al principal' }, { status: 400 })
  }

  if (telSec1 && telSec2 && telSec1 === telSec2) {
    return NextResponse.json({ error: 'Los teléfonos secundarios no pueden ser iguales entre sí' }, { status: 400 })
  }

  const yaTienePropietario = await prisma.propietario.findFirst({
    where: { usuarioId: usuario.id },
  })
  if (yaTienePropietario) {
    return NextResponse.json({ error: 'Ya tienes un perfil de propietario registrado' }, { status: 409 })
  }

  const duplicado = await prisma.propietario.findFirst({
    where: {
      telefonoPrincipal: telPrincipal,
      usuarioId: { not: usuario.id },
    },
    select: { id: true },
  })

  if (duplicado) {
    return NextResponse.json({ error: 'Este teléfono ya está registrado como principal por otro propietario' }, { status: 409 })
  }

  const verificadoPorOtro = await prisma.verificacionSMS.findFirst({
    where: {
      telefono: telPrincipal,
      usuarioId: { not: usuario.id },
      usado: true,
    },
    orderBy: { creadoEn: 'desc' },
  })

  if (verificadoPorOtro) {
    return NextResponse.json({ error: 'Este teléfono ya fue validado por otro usuario' }, { status: 409 })
  }

  const verificado = await prisma.verificacionSMS.findFirst({
    where: {
      usuarioId: usuario.id,
      telefono: telPrincipal,
      usado: false,
      expiradoEn: { gt: new Date() },
    },
    orderBy: { creadoEn: 'desc' },
  })

  if (!verificado) {
    return NextResponse.json({ error: 'El teléfono principal no ha sido verificado' }, { status: 403 })
  }

  const nombreFormateado = nombre
    .trim()
    .toLowerCase()
    .replace(/[^a-záéíóúñ\s]/gi, '')
    .split(' ')
    .filter(Boolean)
    .map((p: string) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')

  const nuevo = await prisma.propietario.create({
    data: {
      nombre: nombreFormateado,
      telefonoPrincipal: telPrincipal,
      telefonoSecundario1: telSec1,
      telefonoSecundario2: telSec2,
      usuario: { connect: { id: usuario.id } },
    },
  })

  await prisma.verificacionSMS.update({
    where: { id: verificado.id },
    data: { usado: true },
  })

  return NextResponse.json({ mensaje: MENSAJES.registroExitoso, propietarioId: nuevo.id })
}