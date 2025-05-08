'use client'

import {
  Box,
  Input,
  Text,
  Button,
  VStack,
  Portal,
  Select,
  createListCollection,
} from '@chakra-ui/react'
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { toaster } from '@/components/ui/toaster'
import { MENSAJES, validarEmail } from '@/lib/validadores'

const rolesList = [
  { label: 'Médico', value: 'MEDICO' },
  { label: 'Auxiliar', value: 'AUXILIAR' },
  { label: 'Propietario', value: 'PROPIETARIO' },
]

const MotionBox = motion(Box)

export default function RegistroUsuarioForm() {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [rol, setRol] = useState<string>('')
  const [cargando, setCargando] = useState(false)
  const [shake, setShake] = useState(false)

  const collection = useMemo(() => {
    return createListCollection({
      items: rolesList,
      itemToString: (item) => item.label,
      itemToValue: (item) => item.value,
    })
  }, [])

  const esFormularioValido =
    validarEmail(correo) &&
    contrasena.length >= 8 &&
    confirmar === contrasena &&
    ['MEDICO', 'AUXILIAR', 'PROPIETARIO'].includes(rol)

  const shakeAnim = () => {
    setShake(true)
    setTimeout(() => setShake(false), 600)
  }

  const handleSubmit = async () => {
    if (!correo || !contrasena || !confirmar || !rol) {
      shakeAnim()
      toaster.create({ description: MENSAJES.camposIncompletos, type: 'error' })
      return
    }

    if (!validarEmail(correo)) {
      shakeAnim()
      toaster.create({ description: MENSAJES.emailInvalido, type: 'error' })
      return
    }

    if (contrasena.length < 8) {
      shakeAnim()
      toaster.create({ description: MENSAJES.contrasenaCorta, type: 'error' })
      return
    }

    if (contrasena !== confirmar) {
      shakeAnim()
      toaster.create({ description: MENSAJES.contrasenasNoCoinciden, type: 'error' })
      return
    }

    if (!['MEDICO', 'AUXILIAR', 'PROPIETARIO'].includes(rol)) {
      shakeAnim()
      toaster.create({ description: MENSAJES.rolInvalido, type: 'error' })
      return
    }

    setCargando(true)

    try {
      const res = await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena, confirmar, rol }),
      })

      const data = await res.json()

      if (!res.ok) {
        shakeAnim()
        const mensaje = Object.values(MENSAJES).includes(data.error)
          ? data.error
          : MENSAJES.errorInterno

        toaster.create({ description: mensaje, type: 'error' })
        return
      }

      toaster.create({ description: MENSAJES.registroExitoso, type: 'success' })
      setCorreo('')
      setContrasena('')
      setConfirmar('')
      setRol('')
    } catch (err: any) {
      toaster.create({
        description: err.message || MENSAJES.errorInterno,
        type: 'error',
      })
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
          <Text mb={1} fontWeight="medium">Confirmar contraseña</Text>
          <Input
            type="password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="********"
          />
        </Box>

        <Box w="full">
          <Text mb={1} fontWeight="medium">Rol</Text>
          <Select.Root
            collection={collection}
            value={rol ? [rol] : []}
            onValueChange={({ value }) => {
              if (value && value.length > 0) {
                setRol(value[0])
              }
            }}
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
          disabled={cargando || !esFormularioValido}
          w="full"
        >
          Registrarse
        </Button>
      </VStack>
    </MotionBox>
  )
}