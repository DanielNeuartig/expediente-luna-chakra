'use client'

import { Box, Heading, Text, Button } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

export default function NoAutorizadoPage() {
  const router = useRouter()

  return (
    <Box textAlign="center" py={20} px={4}>
      <Heading as="h1" size="xl" mb={4}>
        Acceso denegado
      </Heading>
      <Text fontSize="lg" mb={6}>
        No tienes permiso para ver esta página.
      </Text>
      <Button colorScheme="teal" onClick={() => router.push('/')}>
        Volver al inicio
      </Button>
    </Box>
  )
}