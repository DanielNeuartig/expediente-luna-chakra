import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MENSAJES } from '@/lib/validadores'
import { verificarTokenYRolEnDB } from '@/lib/autenticacion/verificarTokenYRolEnDB'
import { extraerToken } from '@/lib/autenticacion/extraerToken'
import { TipoAcceso } from '@prisma/client'
import { Twilio } from 'twilio'

const twilio = new Twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

const formatearNombre = (nombre: string): string =>
  nombre
    .trim()
    .toLowerCase()
    .replace(/[^a-záéíóúñü\s]/gi, '')
    .split(' ')
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')

export async function POST(req: Request) {
  const token = extraerToken(req)
  if (!token?.trim()) {
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
    codigo,
  } = await req.json()

  if (
    typeof nombre !== 'string' ||
    typeof telefonoPrincipal !== 'string' ||
    typeof codigo !== 'string'
  ) {
    return NextResponse.json({ error: MENSAJES.camposIncompletos }, { status: 400 })
  }

  if (!/^\d{4,8}$/.test(codigo.trim())) {
    return NextResponse.json({ error: MENSAJES.codigoIncorrecto }, { status: 400 })
  }

  const palabras = nombre.trim().split(/\s+/).filter(Boolean)
  if (palabras.length < 2) {
    return NextResponse.json({ error: MENSAJES.nombreIncompleto }, { status: 400 })
  }

  if (!/^[a-záéíóúñü\s]+$/i.test(nombre.trim())) {
    return NextResponse.json({ error: MENSAJES.nombreInvalido }, { status: 400 })
  }
  console.log('🟢 [VERIFICAR CÓDIGO] Teléfono recibido:', telefonoPrincipal)
  const telPrincipal = telefonoPrincipal.trim().replace(/\s/g, '')
  console.log('🟢 [VERIFICAR CÓDIGO] Teléfono usado para validar código:', telPrincipal)
console.log('🧾 [VERIFICAR CÓDIGO] Código recibido:', codigo)


const sinClave = telPrincipal.slice(-10)


console.log('📞 [VALIDACIÓN TELÉFONO]');
console.log('→ telPrincipal:', telPrincipal);
console.log('→ sinClave:', sinClave);
console.log('→ ¿telPrincipal válido?', /^\+\d{10,15}$/.test(telPrincipal));
console.log('→ ¿sinClave válido?', /^\d{10}$/.test(sinClave));

if (!/^\+\d{10,15}$/.test(telPrincipal) || !/^\d{10}$/.test(sinClave)) {
  return NextResponse.json({ error: MENSAJES.telefonoInvalido }, { status: 400 })
}

  const telSec1 = telefonoSecundario1?.replace(/\D/g, '') || null
  const telSec2 = telefonoSecundario2?.replace(/\D/g, '') || null

  if ((telSec1 && telSec1.length !== 10) || (telSec2 && telSec2.length !== 10)) {
    return NextResponse.json({ error: MENSAJES.telefonoSecundarioInvalido }, { status: 400 })
  }

  const secundarios = [telSec1, telSec2].filter(Boolean)
  if (secundarios.includes(sinClave)) {
    return NextResponse.json({ error: MENSAJES.telefonoSecundarioIgual }, { status: 400 })
  }

  if (telSec1 && telSec2 && telSec1 === telSec2) {
    return NextResponse.json({ error: MENSAJES.telefonosIguales }, { status: 400 })
  }

  const yaTiene = await prisma.propietario.findFirst({
    where: { usuarioId: usuario.id },
  })
  if (yaTiene) {
    return NextResponse.json({ error: MENSAJES.yaTienePropietario }, { status: 409 })
  }

  const duplicado = await prisma.propietario.findFirst({
    where: {
      telefonoPrincipal: telPrincipal,
      usuarioId: { not: usuario.id },
    },
    select: { id: true },
  })
  if (duplicado) {
    return NextResponse.json({ error: MENSAJES.telefonoYaRegistrado }, { status: 409 })
  }

  try {
    console.log('🟡!! [REGISTRO] Teléfono recibido del frontend:', telefonoPrincipal)
console.log('🟡!! [REGISTRO] Teléfono sin espacios:', telPrincipal)
console.log('🟡!! [REGISTRO] Código ingresado:', codigo.trim())
    const resultado = await twilio.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verificationChecks.create({
        to: telPrincipal,
        code: codigo.trim(),
      })
      
      console.log('🧪 [VERIFICAR CÓDIGO] Resultado Twilio:', resultado)

    if (resultado.status !== 'approved') {
      return NextResponse.json({ error: MENSAJES.codigoIncorrecto }, { status: 401 })
    }
  } catch (err) {
    console.error('❌ Error al verificar el código con Twilio:', err)
    return NextResponse.json({ error: MENSAJES.falloVerificacionCodigo }, { status: 500 })
  }

  const nombreFormateado = formatearNombre(nombre)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '0.0.0.0'

  try {
    const nuevoPropietario = await prisma.$transaction(async (tx) => {
      const creado = await tx.propietario.create({
        data: {
          nombre: nombreFormateado,
          telefonoPrincipal: telPrincipal,
          telefonoSecundario1: telSec1,
          telefonoSecundario2: telSec2,
          usuario: { connect: { id: usuario.id } },
        },
      })

      await tx.usuario.update({
        where: { id: usuario.id },
        data: { propietarioId: creado.id },
      })

      await tx.acceso.create({
        data: {
          usuarioId: usuario.id,
          ip,
          tipoAcceso: TipoAcceso.REGISTRO_PROPIETARIO,
        },
      })

      return creado
    })

    return NextResponse.json({
      mensaje: MENSAJES.registroExitoso,
      propietarioId: nuevoPropietario.id,
    })
  } catch (error) {
    console.error('❌ Error en transacción de creación de propietario:', error)
    return NextResponse.json({ error: MENSAJES.errorInterno }, { status: 500 })
  }
}