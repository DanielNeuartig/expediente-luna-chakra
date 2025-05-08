'use client'

import { HStack, Input } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { formatearTelefonoVisual, /*esTelefonoValido */} from '@/lib/validadores'

interface Props {
  clavePais: string
  setClavePais: (val: string) => void
  telefono: string
  setTelefono: (val: string) => void
  onEnter?: () => void
  disabled?: boolean
  loading?: boolean
  placeholder?: string
}

export default function InputTelefonoConClave({
  clavePais,
  setClavePais,
  telefono,
  setTelefono,
  onEnter,
  disabled = false,
  loading = false,
  placeholder = '33 33 33 33 33',
}: Props) {
  const [telefonoValido, setTelefonoValido] = useState(true)
  const [claveValida, setClaveValida] = useState(true)

  // Validar clave: debe comenzar con '+' y tener máximo 4 caracteres
  useEffect(() => {
    setClaveValida(/^(\+\d{1,3})?$/.test(clavePais))
  }, [clavePais])

  // Validar número completo sólo si se escribió algo
  useEffect(() => {
  const soloTelefono = telefono.replace(/\D/g, '')
  setTelefonoValido(!telefono || soloTelefono.length === 10)
}, [telefono])

  const handleClaveChange = (val: string) => {
    const formateado = val.startsWith('+') ? '+' + val.slice(1).replace(/\D/g, '') : '+' + val.replace(/\D/g, '')
    setClavePais(formateado.slice(0, 4)) // Limita a "+123"
  }

  return (
    <HStack>
      <Input
        maxW="30%"
        value={clavePais}
        onChange={(e) => handleClaveChange(e.target.value)}
        placeholder="+52"
        borderColor={!claveValida ? 'red.500' : undefined}
        boxShadow={!claveValida ? '0 0 0 1px var(--chakra-colors-red-500)' : undefined}
        disabled={disabled || loading}
      />
      <Input
        flex="1"
        value={telefono}
        onChange={(e) => setTelefono(formatearTelefonoVisual(e.target.value))}
        placeholder={placeholder}
        onKeyDown={(e) => e.key === 'Enter' && onEnter?.()}
        borderColor={!telefonoValido ? 'red.500' : undefined}
        boxShadow={!telefonoValido ? '0 0 0 1px var(--chakra-colors-red-500)' : undefined}
        disabled={disabled || loading}
      />
    </HStack>
  )
}