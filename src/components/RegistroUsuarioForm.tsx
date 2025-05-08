'use client'

import {
  Box,
  Input,
  Text,
  Button,
  VStack,
  Portal,
  Select,
  Spinner,
  createListCollection,
} from '@chakra-ui/react'
import { useState, useMemo } from 'react'
import { toaster } from '@/components/ui/toaster'
import { MENSAJES } from '@/lib/validadores'

const rolesList = [
  { label: 'Médico', value: 'MEDICO' },
  { label: 'Auxiliar', value: 'AUXILIAR' },
  { label: 'Propietario', value: 'PROPIETARIO' },
]

export default function RegistroUsuario() {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [rol, setRol] = useState<string>('')
  const [cargando, setCargando] = useState(false)

  const collection = useMemo(() => {
    return createListCollection({
      items: rolesList,
      itemToString: (item) => item.label,
      itemToValue: (item) => item.value,
    })
  }, [])

  const handleSubmit = async () => {
    if (!correo || !contrasena || !rol) {
      toaster.create({ description: MENSAJES.camposIncompletos, type: 'error' })
      return
    }



    if (contrasena.length < 8) {
      toaster.create({ description: MENSAJES.contrasenaCorta, type: 'error' })
      return
    }

    setCargando(true)

    try {
      const res = await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena, rol }),
      })

      const data = await res.json()

      if (!res.ok) {
        const mensaje = Object.values(MENSAJES).includes(data.error)
          ? data.error
          : MENSAJES.errorInterno
      
        toaster.create({ description: mensaje, type: 'error' })
        return
      }

      toaster.create({ description: MENSAJES.registroExitoso, type: 'success' })
      setCorreo('')
      setContrasena('')
      setRol('')
    } catch (err: any) {
      const esErrorDeRed = err instanceof TypeError && err.message === 'Failed to fetch'
      toaster.create({
        description: esErrorDeRed ? MENSAJES.errorConexion : err.message || MENSAJES.errorInterno,
        type: 'error',
      })
    } finally {
      setCargando(false)
    }
  }

  return (
    <Box maxW="sm" mx="auto" mt={10} p={6} borderWidth={1} borderRadius="xl" boxShadow="md">
      <VStack gap={6}>
        <Box w="full">
          <Text mb={1} fontWeight="medium">Correo electrónico</Text>
          <Input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="correo@ejemplo.com"
          />
        </Box>

        <Box w="full">
          <Text mb={1} fontWeight="medium">Contraseña</Text>
          <Input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="********"
          />
        </Box>

        <Box w="full">
          <Text mb={1} fontWeight="medium">Rol</Text>
          <Select.Root
            collection={collection}
            value={rol ? [rol] : []}
            onValueChange={(e) => setRol(e.value[0])}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            multiple={false}
            size="sm"
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Selecciona un rol" />
              </Select.Trigger>
              <Select.Indicator />
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {collection.items.map((item) => (
                    <Select.Item key={item.value} item={item}>
                      {item.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </Box>

        <Button
          colorScheme="teal"
          onClick={handleSubmit}
          loading={cargando}
          loadingText="Registrando..."
          disabled={cargando}
          w="full"
        >
          Registrarse
        </Button>
      </VStack>
    </Box>
  )
}