'use client'
import { Box, Text } from '@chakra-ui/react'
import Image from "next/image";
import LoginForm from '@/components/LoginForm'
import RegistroUsuario from '@/components/RegistroUsuarioForm'
import { AuthProvider } from '@/context/AuthContext'
import { useAuth } from '@/context/AuthContext'

export default function HomePage() {
  const { usuario } = useAuth()
  return (
    <main>
    <Box p={4}>
      {usuario ? (
        <Text fontWeight="bold" color="teal.600">
          Sesión iniciada como: {usuario.correo} (Rol: {usuario.rol})
        </Text>
      ) : (
        <Text color="gray.500">Ningún usuario ha iniciado sesión</Text>
      )}
    </Box>
      

      <RegistroUsuario />
      <LoginForm/>
    </main>
  )
}
