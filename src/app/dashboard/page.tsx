'use client'

import { Box, Heading, Text } from '@chakra-ui/react'
import ProteccionRol from '@/components/ProteccionRol'

export default function DashboardPage() {
  return (
    <ProteccionRol minimo="AUXILIAR">
      <Box p={8}>
        <Heading size="lg" mb={4}>Bienvenido al panel</Heading>
        <Text>Contenido exclusivo para auxiliares y roles superiores.</Text>
      </Box>
    </ProteccionRol>
  )
}   