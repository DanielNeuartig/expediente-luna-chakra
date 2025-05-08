'use client'

import {
  Box,
  Text,
  Button,
  VStack,
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
  esTelefonoValido,
} from '@/lib/validadores'
import InputTelefonoConClave from '@/components/InputTelefonoConClave'
import InputCorreo from '@/components/InputCorreo'
import InputContrasena from '@/components/InputContrasena'

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
    } finally {
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
          <InputCorreo
            correo={correo}
            setCorreo={setCorreo}
            onEnter={handleSubmit}
            disabled={cargando}
          />
        ) : (
          <Box width="100%">
            <Text mb={1} fontWeight="medium">Teléfono</Text>
            <InputTelefonoConClave
              clavePais={clave}
              setClavePais={setClave}
              telefono={telefono}
              setTelefono={setTelefono}
              onEnter={handleSubmit}
              disabled={cargando}
            />
          </Box>
        )}

        <InputContrasena
          contrasena={contrasena}
          setContrasena={setContrasena}
          onEnter={handleSubmit}
          disabled={cargando}
        />

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