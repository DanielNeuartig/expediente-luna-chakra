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
import { motion } from 'framer-motion'
import { toaster } from '@/components/ui/toaster'
import { useAuth } from '@/context/AuthContext'
import {
  MENSAJES,
  validarEmail,
  formatearTelefonoVisual,
  esTelefonoValido,
} from '@/lib/validadores'

const MotionBox = motion(Box)

export default function LoginForm() {
  const [modo, setModo] = useState<'correo' | 'telefono'>('correo')
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('+52')
  const [telefono, setTelefono] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [cargando, setCargando] = useState(false)
  const [shake, setShake] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const telSinEspacios = telefono.replace(/\D/g, '')
  const identificador =
    modo === 'correo'
      ? correo.trim().toLowerCase()
      : `${clave.trim()}${telSinEspacios}`

  const esFormularioValido =
    modo === 'correo'
      ? validarEmail(correo) && contrasena.length >= 8
      : esTelefonoValido(identificador) && contrasena.length >= 8

  const handleSubmit = async () => {
    if (!identificador || !contrasena) {
      setShake(true)
      setTimeout(() => setShake(false), 600)
      toaster.create({ description: MENSAJES.camposIncompletos, type: 'error' })
      return
    }

    if (modo === 'correo' && !validarEmail(correo)) {
      setShake(true)
      setTimeout(() => setShake(false), 600)
      toaster.create({ description: MENSAJES.emailInvalido, type: 'error' })
      return
    }

    if (modo === 'telefono' && !esTelefonoValido(identificador)) {
      setShake(true)
      setTimeout(() => setShake(false), 600)
      toaster.create({ description: MENSAJES.telefonoInvalido, type: 'error' })
      return
    }

    if (contrasena.length < 8) {
      setShake(true)
      setTimeout(() => setShake(false), 600)
      toaster.create({ description: MENSAJES.contrasenaCorta, type: 'error' })
      return
    }

    setCargando(true)

    try {
      await login(identificador, contrasena)
      toaster.create({ description: MENSAJES.inicioSesionExitoso, type: 'success' })
      router.push('/dashboard')

    } catch (err: any) {
  setShake(true)
  setTimeout(() => setShake(false), 600)

  const esErrorDeRed = err instanceof TypeError && err.message === 'Failed to fetch'
  const mensaje = esErrorDeRed
    ? MENSAJES.errorConexion
    : Object.values(MENSAJES).includes(err.message)
      ? err.message
      : MENSAJES.errorInterno

  toaster.create({ description: mensaje, type: 'error' })
}finally {
      setCargando(false)
    }
  }

  return (
    <MotionBox
      animate={{
        ...(shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}),
        opacity: 1,
        y: 0,
      }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      maxW="sm"
      mx="auto"
      mt={10}
      p={6}
      borderWidth={1}
      borderRadius="xl"
      boxShadow="md"
    >
      <VStack>
        <Flex justify="space-between" width="100%" mb={4}>
          <Button
            variant={modo === 'correo' ? 'solid' : 'outline'}
            colorScheme={modo === 'correo' ? 'teal' : undefined}
            onClick={() => setModo('correo')}
          >
            Correo
          </Button>
          <Button
            variant={modo === 'telefono' ? 'solid' : 'outline'}
            colorScheme={modo === 'telefono' ? 'teal' : undefined}
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
                onChange={(e) => setTelefono(formatearTelefonoVisual(e.target.value))}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="33 33 33 33 33"
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
          disabled={cargando || !esFormularioValido}
          width="full"
          mt={4}
        >
          Iniciar sesión
        </Button>
      </VStack>
    </MotionBox>
  )
}