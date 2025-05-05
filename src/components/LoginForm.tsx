'use client'

import { Box, Input, Text, Button, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toaster } from '@/components/ui/toaster'
import { useAuth } from '@/context/AuthContext'
import { validarEmail, MENSAJES } from '@/lib/validadores'

export default function LoginForm() {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [cargando, setCargando] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async () => {
    if (!correo || !contrasena) {
      toaster.create({ description: MENSAJES.camposIncompletos, type: 'error' })
      return
    }

    if (!validarEmail(correo)) {
      toaster.create({ description: MENSAJES.emailInvalido, type: 'error' })
      return
    }

    if (contrasena.length < 8) {
      toaster.create({ description: MENSAJES.contrasenaCorta, type: 'error' })
      return
    }

    setCargando(true)

    try {
      await login(correo, contrasena)
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
        <Box>
          <Text mb={1} fontWeight="medium">Correo electrónico</Text>
          <Input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="correo@ejemplo.com"
          />
        </Box>
        <Box>
          <Text mb={1} fontWeight="medium">Contraseña</Text>
          <Input
            type="password"
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
        >
          Iniciar sesión
        </Button>
      </VStack>
    </Box>
  )
}