'use client'

import { useAuth } from '@/context/AuthContext'
import { Box, Text, Flex, Icon } from '@chakra-ui/react'
import { LuUser, LuMail, LuShield, LuPhone } from 'react-icons/lu'

export default function PaginaUsuario() {
  const { usuario } = useAuth()

  if (!usuario) return null

  return (
    <Box maxW="600px" mx="auto" p={4}>
      <Text fontSize="2xl" fontWeight="bold" mb={6}>
        Información del usuario
      </Text>

      <Flex direction="column" gap={4}>
        <Flex align="center" gap={3}>
          <Icon as={LuMail} />
          <Text>Email: {usuario.correo}</Text>
        </Flex>

        <Flex align="center" gap={3}>
          <Icon as={LuShield} />
          <Text>Rol: {usuario.rol}</Text>
        </Flex>

        {usuario.propietario && (
          <>
            <Text fontSize="xl" fontWeight="semibold" mt={6}>
              Información de propietario
            </Text>

            <Flex align="center" gap={3}>
              <Icon as={LuUser} />
              <Text>Nombre: {usuario.propietario.nombre}</Text>
            </Flex>

            {usuario.propietario.telefonoPrincipal && (
              <Flex align="center" gap={3}>
                <Icon as={LuPhone} />
                <Text>Teléfono: {usuario.propietario.telefonoPrincipal}</Text>
              </Flex>
            )}
          </>
        )}
      </Flex>
    </Box>
  )
}