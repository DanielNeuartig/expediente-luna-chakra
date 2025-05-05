// app/registro-propietario/page.tsx

'use client'

import RegistroPropietario from '@/components/RegistroPropietario'
import { Box } from '@chakra-ui/react'

export default function RegistroPropietarioPage() {
  return (
    <Box p={4}>
      <RegistroPropietario />
    </Box>
  )
}