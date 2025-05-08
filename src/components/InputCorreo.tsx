'use client'

import { Box, Input, Text } from '@chakra-ui/react'
import { validarEmail } from '@/lib/validadores'
import { useEffect, useState } from 'react'

interface Props {
  correo: string
  setCorreo: (val: string) => void
  onEnter?: () => void
  disabled?: boolean
  placeholder?: string
}

export default function InputCorreo({
  correo,
  setCorreo,
  onEnter,
  disabled = false,
  placeholder = 'correo@ejemplo.com',
}: Props) {
  const [esValido, setEsValido] = useState(true)

  useEffect(() => {
    setEsValido(validarEmail(correo))
  }, [correo])

  return (
    <Box w="full">
      <Text mb={1} fontWeight="medium">
        Correo electrónico
      </Text>
      <Input
        type="email"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onEnter?.()}
        placeholder={placeholder}
        borderColor={correo.length > 0 && !esValido ? 'red.500' : undefined}
boxShadow={correo.length > 0 && !esValido ? '0 0 0 1px var(--chakra-colors-red-500)' : undefined}
        disabled={disabled}
      />
    </Box>
  )
}