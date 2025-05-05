'use client'
import { Box, Heading } from '@chakra-ui/react'
import LoginForm from '@/components/LoginForm'

export default function LoginPage() {
  return (
    <Box maxW="400px" mx="auto" mt="16">
      <Heading size="lg" mb="6" textAlign="center">
        Iniciar sesión
      </Heading>
      <LoginForm />
    </Box>
  )
}