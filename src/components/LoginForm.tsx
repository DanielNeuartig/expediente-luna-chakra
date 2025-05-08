'use client'

import {
  Box,
  Text,
  Input,
  Button,
  VStack,
  HStack,
  Flex,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toaster } from '@/components/ui/toaster'
import { useAuth } from '@/context/AuthContext'
import { MENSAJES } from '@/lib/validadores'

export default function LoginForm() {
  const [modo, setModo] = useState<'correo' | 'telefono'>('correo')
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('+52')
  const [telefono, setTelefono] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [cargando, setCargando] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async () => {
    const identificador =
      modo === 'correo' ? correo.trim() : `${clave.trim()}${telefono.trim()}`

    if (!identificador || !contrasena) {
      toaster.create({ description: MENSAJES.camposIncompletos, type: 'error' })
      return
    }

    if (modo === 'telefono' && !/^\+\d{1,4}\d{10}$/.test(identificador)) {
      toaster.create({ description: MENSAJES.telefonoInvalido, type: 'error' })
      return
    }

    if (contrasena.length < 8) {
      toaster.create({ description: MENSAJES.contrasenaCorta, type: 'error' })
      return
    }

    setCargando(true)

    try {
      await login(identificador, contrasena)
      toaster.create({ description: MENSAJES.inicioSesionExitoso, type: 'success' })
      router.push('/dashboard')
    } catch (err: any) {
      const esErrorDeRed = err instanceof TypeError && err.message === 'Failed to fetch'
      const mensaje = esErrorDeRed
        ? MENSAJES.errorConexion
        : Object.values(MENSAJES).includes(err.message)
          ? err.message
          : MENSAJES.errorInterno

      toaster.create({ description: mensaje, type: 'error' })
    } finally {
      setCargando(false)
    }
  }

  return (
    <Box maxW="sm" mx="auto" mt={10} p={6} borderWidth={1} borderRadius="xl" boxShadow="md">
      <VStack>
        <Flex justify="space-between" width="100%">
          <Button
            variant={modo === 'correo' ? 'solid' : 'outline'}
            onClick={() => setModo('correo')}
          >
            Correo
          </Button>
          <Button
            variant={modo === 'telefono' ? 'solid' : 'outline'}
            onClick={() => setModo('telefono')}
          >
            Teléfono
          </Button>
        </Flex>

        {modo === 'correo' ? (
          <Box width="100%">
            <Text mb={1} fontWeight="medium">Correo electrónico</Text>
            <Input
              type="email"
              autoComplete="username"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="correo@ejemplo.com"
            />
          </Box>
        ) : (
          <Box width="100%">
            <Text mb={1} fontWeight="medium">Teléfono</Text>
            <HStack>
              <Input
                maxW="30%"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                placeholder="+52"
              />
              <Input
                type="tel"
                autoComplete="username"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="1234567890"
              />
            </HStack>
          </Box>
        )}

        <Box width="100%">
          <Text mb={1} fontWeight="medium">Contraseña</Text>
          <Input
            type="password"
            autoComplete="current-password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="********"
          />
        </Box>

        <Button
          colorScheme="teal"
          onClick={handleSubmit}
          loading={cargando}
          loadingText="Iniciando..."
          disabled={cargando}
          width="full"
        >
          Iniciar sesión
        </Button>
      </VStack>
    </Box>
  )
}