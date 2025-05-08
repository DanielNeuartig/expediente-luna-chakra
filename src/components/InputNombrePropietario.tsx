'use client'

import { Box, Input, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

interface Props {
  nombre: string
  setNombre: (val: string) => void
  onEnter?: () => void
  disabled?: boolean
  placeholder?: string
}

export default function InputNombrePropietario({
  nombre,
  setNombre,
  onEnter,
  disabled = false,
  placeholder = 'Nombre y apellido',
}: Props) {
  const [esValido, setEsValido] = useState(true)

  const formatearNombre = (valor: string) =>
    valor
      .toLowerCase()
      .replace(/[^a-záéíóúñ\s]/gi, '')
      .replace(/\b\w/g, (c) => c.toUpperCase())

  useEffect(() => {
    const palabras = nombre.trim().split(/\s+/).filter(Boolean)
    setEsValido(nombre.trim().length === 0 || palabras.length >= 2)
  }, [nombre])

  return (
    <Box w="full">
      <Text mb={1} fontWeight="medium">Nombre completo</Text>
      <Input
        value={nombre}
        onChange={(e) => setNombre(formatearNombre(e.target.value))}
        onKeyDown={(e) => e.key === 'Enter' && onEnter?.()}
        placeholder={placeholder}
        borderColor={!esValido ? 'red.500' : undefined}
        boxShadow={!esValido ? '0 0 0 1px var(--chakra-colors-red-500)' : undefined}
        disabled={disabled}
      />
    </Box>
  )
}