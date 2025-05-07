'use client'

import {
  Box,
  createListCollection,
  Portal,
  Button,
  NativeSelect,
  Input,
  Text,
  VStack,
  Select,
  Separator,
  HStack,
  InputGroup,
  InputAddon
} from '@chakra-ui/react'
import { useState } from 'react'
import { toaster } from '@/components/ui/toaster'
import { useAuth } from '@/context/AuthContext'

const ladaCollection = createListCollection({
  items: [{ label: '+52', value: 'mx' }],
})

export default function RegistroPropietario() {
  const { usuario, logout } = useAuth()
  const [nombre, setNombre] = useState('')
  const [telefonoPrincipal, setTelefonoPrincipal] = useState('')
  const [telefonoSecundario1, setTelefonoSecundario1] = useState('')
  const [telefonoSecundario2, setTelefonoSecundario2] = useState('')
  const [codigo, setCodigo] = useState('')
  const [codigoVerificado, setCodigoVerificado] = useState(false)
  const [enviandoCodigo, setEnviandoCodigo] = useState(false)
  const [verificando, setVerificando] = useState(false)
  const [cargando, setCargando] = useState(false)

  const formatearNombre = (valor: string) =>
    valor
      .toLowerCase()
      .replace(/[^a-záéíóúñ\s]/gi, '')
      .replace(/\b\w/g, (c) => c.toUpperCase())

  const formatearTelefono = (valor: string) =>
    valor.replace(/\D/g, '').slice(0, 10).replace(/(\d{2})(?=\d)/g, '$1 ').trim()

  const validarTelefono = (tel: string) =>
    tel === '' || tel.replace(/\D/g, '').length === 10

  const telefonoConPrefijo = () => {
    const limpio = telefonoPrincipal.replace(/\D/g, '')
    return `+52${limpio}`
  }

  const enviarCodigo = async () => {
    const tel = telefonoConPrefijo()
    if (!/^\+52\d{10}$/.test(tel)) {
      toaster.create({ description: 'Número inválido para enviar SMS', type: 'error' })
      return
    }
    setEnviandoCodigo(true)
    try {
      const res = await fetch('/api/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')!).token : ''}`,
        },
        body: JSON.stringify({ telefono: tel }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al enviar código')
      toaster.create({ description: 'Código enviado por SMS', type: 'success' })
    } catch (error: any) {
      toaster.create({ description: error.message, type: 'error' })
    } finally {
      setEnviandoCodigo(false)
    }
  }

  const verificarCodigo = async () => {
    setVerificando(true)
    try {
      const res = await fetch('/api/sms/verificar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')!).token : ''}`,
        },
        body: JSON.stringify({ telefono: telefonoConPrefijo(), codigo }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Código incorrecto')
      toaster.create({ description: 'Teléfono verificado', type: 'success' })
      setCodigoVerificado(true)
    } catch (error: any) {
      toaster.create({ description: error.message, type: 'error' })
    } finally {
      setVerificando(false)
    }
  }

  const handleSubmit = async () => {
    const palabras = nombre.trim().split(/\s+/)
    if (
      palabras.length < 2 ||
      !validarTelefono(telefonoPrincipal) ||
      !validarTelefono(telefonoSecundario1) ||
      !validarTelefono(telefonoSecundario2)
    ) {
      toaster.create({ description: 'Verifica que el nombre tenga al menos dos palabras y que los teléfonos sean válidos', type: 'error' })
      return
    }

    if (!codigoVerificado) {
      toaster.create({ description: 'Debes verificar tu teléfono principal antes de continuar', type: 'error' })
      return
    }

    const payload = {
      nombre: nombre.trim(),
      telefonoPrincipal: telefonoPrincipal.replace(/\D/g, ''),
      telefonoSecundario1: telefonoSecundario1.replace(/\D/g, '') || null,
      telefonoSecundario2: telefonoSecundario2.replace(/\D/g, '') || null,
    }

    setCargando(true)

    try {
      const res = await fetch('/api/registro-propietario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Error al registrar propietario')

      toaster.create({ description: 'Registro exitoso', type: 'success' })
      setNombre('')
      setTelefonoPrincipal('')
      setTelefonoSecundario1('')
      setTelefonoSecundario2('')
      setCodigo('')
      setCodigoVerificado(false)
    } catch (error: any) {
      toaster.create({ description: error.message, type: 'error' })
    } finally {
      setCargando(false)
    }
  }

  return (
    <Box maxW="sm" mx="auto" mt={10} p={6} borderWidth={1} borderRadius="xl" boxShadow="md">
      <VStack align="stretch" separator={<Separator />}>
        <Box w="full" textAlign="center">
          <Text fontSize="lg" fontWeight="bold">¡Bienvenido!</Text>
          <Text fontSize="md" color="gray.600">
            Usuario: {usuario?.id} · Rol: {usuario?.rol}
          </Text>
          <Text fontSize="sm" color="gray.500">
            Correo: {usuario?.correo || 'No disponible'}
          </Text>
        </Box>

        <Box>
          <Text mb={1}>Nombre completo</Text>
          <Input
            value={nombre}
            onChange={(e) => setNombre(formatearNombre(e.target.value))}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Nombre y apellido"
          />
        </Box>

        <Box>
  <Text mb={1}>Teléfono principal</Text>
  <HStack align="start">
    <InputGroup /*size="md"*/ flex="1" startAddon="+52">
      <Input
        value={telefonoPrincipal}
        onChange={(e) => {
          setTelefonoPrincipal(formatearTelefono(e.target.value))
          setCodigoVerificado(false)
        }}
        placeholder="33 33 33 33 33"
      />
    </InputGroup>
    <Button
      size="sm"
      onClick={enviarCodigo}
      loading={enviandoCodigo}
      disabled={enviandoCodigo}
    >
      Enviar código
    </Button>
  </HStack>
</Box>
        <Box>
          <Text mb={1}>Código de verificación</Text>
          <HStack>
            <Input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="123456"
              disabled={codigoVerificado}
            />
            <Button size="sm" onClick={verificarCodigo} loading={verificando} disabled={verificando || codigoVerificado}>
              Verificar
            </Button>
          </HStack>
        </Box>

        <Box>
          <Text mb={1}>Teléfono secundario 1 (opcional)</Text>
          <Input
            value={telefonoSecundario1}
            onChange={(e) => setTelefonoSecundario1(formatearTelefono(e.target.value))}
            placeholder="33 33 33 33 33"
          />
        </Box>

        <Box>
          <Text mb={1}>Teléfono secundario 2 (opcional)</Text>
          <Input
            value={telefonoSecundario2}
            onChange={(e) => setTelefonoSecundario2(formatearTelefono(e.target.value))}
            placeholder="33 33 33 33 33"
          />
        </Box>

        <Button
          colorScheme="teal"
          onClick={handleSubmit}
          loading={cargando}
          loadingText="Guardando..."
          disabled={cargando}
          w="full"
        >
          Concluir registro
        </Button>

        <Button
          colorScheme="red"
          variant="outline"
          onClick={logout}
          disabled={cargando}
          w="full"
        >
          Cerrar sesión
        </Button>
      </VStack>
    </Box>
  )
}