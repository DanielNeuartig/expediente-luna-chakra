'use client'

import { Box, Text } from '@chakra-ui/react'

export default function DashboardPage() {
  return (
    <Box>
      <Text fontSize="2xl" fontWeight="bold">
        Bienvenido al dashboard
      </Text>
      <Text color="gray.600">Selecciona una opción del menú</Text>
    </Box>
  )
}