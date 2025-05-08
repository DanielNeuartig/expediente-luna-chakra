'use client'

import { Box, Input, Text } from '@chakra-ui/react'

interface Props {
  contrasena: string
  setContrasena: (val: string) => void
  compararContra?: string
  modoConfirmar?: boolean
  onEnter?: () => void
  disabled?: boolean
  placeholder?: string
}

export default function InputContrasena({
  contrasena,
  setContrasena,
  compararContra = '',
  modoConfirmar = false,
  onEnter,
  disabled = false,
  placeholder = '********',
}: Props) {
  const esLongitudValida = contrasena.length >= 8
  const coincide = contrasena === compararContra
  const debeMostrarError =
    contrasena.length > 0 && (modoConfirmar ? !coincide : !esLongitudValida)

  return (
    <Box w="full">
      <Text mb={1} fontWeight="medium">
        {modoConfirmar ? 'Confirmar contraseña' : 'Contraseña'}
      </Text>
      <Input
        type="password"
        value={contrasena}
        onChange={(e) => setContrasena(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onEnter?.()}
        placeholder={placeholder}
        borderColor={debeMostrarError ? 'red.500' : undefined}
        boxShadow={debeMostrarError ? '0 0 0 1px var(--chakra-colors-red-500)' : undefined}
        autoComplete={modoConfirmar ? 'new-password' : 'current-password'}
        disabled={disabled}
      />
    </Box>
  )
}