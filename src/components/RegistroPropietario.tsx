'use client'

import {
  Box,
  Button,
  Input,
  Text,
  VStack,
  Separator,
} from '@chakra-ui/react'
import { useState } from 'react'
import { toaster } from '@/components/ui/toaster'
import { useAuth } from '@/context/AuthContext'

export default function RegistroPropietario() {
  const { usuario, logout } = useAuth()
  const [nombre, setNombre] = useState('')
  const [telefonoPrincipal, setTelefonoPrincipal] = useState('')
  const [telefonoSecundario1, setTelefonoSecundario1] = useState('')
  const [telefonoSecundario2, setTelefonoSecundario2] = useState('')
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

  const handleSubmit = async () => {
    if (
      !nombre.trim() ||
      !validarTelefono(telefonoPrincipal) ||
      !validarTelefono(telefonoSecundario1) ||
      !validarTelefono(telefonoSecundario2)
    ) {
      toaster.create({ description: 'Verifica los campos antes de continuar', type: 'error' })
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

        <Box w="full">
          <Text mb={1}>Nombre completo</Text>
          <Input
            value={nombre}
            onChange={(e) => setNombre(formatearNombre(e.target.value))}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Nombre y apellido"
          />
        </Box>

        <Box w="full">
          <Text mb={1}>Teléfono principal</Text>
          <Input
            value={telefonoPrincipal}
            onChange={(e) => setTelefonoPrincipal(formatearTelefono(e.target.value))}
            placeholder="33 33 33 33 33"
          />
        </Box>

        <Box w="full">
          <Text mb={1}>Teléfono secundario 1 (opcional)</Text>
          <Input
            value={telefonoSecundario1}
            onChange={(e) => setTelefonoSecundario1(formatearTelefono(e.target.value))}
            placeholder="33 33 33 33 33"
          />
        </Box>

        <Box w="full">
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