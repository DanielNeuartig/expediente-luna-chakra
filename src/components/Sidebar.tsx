'use client'

import { Box, Button, Icon, Link as ChakraLink, Text, VStack } from '@chakra-ui/react'
import { LuLogOut, LuLayoutDashboard } from 'react-icons/lu'
import NextLink from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}) {
  const { usuario, logout } = useAuth()

  const menu = [
    {
      label: 'Inicio',
      href: '/dashboard',
      icon: LuLayoutDashboard,
      roles: ['CEO', 'ADMIN', 'MEDICO', 'AUXILIAR'],
    },
    // Puedes agregar más rutas aquí según el rol
  ]

  const seccionesVisibles = menu.filter((item) =>
    usuario ? item.roles.includes(usuario.rol) : false
  )

  return (
    <Box
      as="nav"
      id="sidebar"
      w={{ base: sidebarOpen ? '200px' : '0px', md: '200px' }}
      minW="0"
      bg="gray.800"
      color="white"
      transition="width 0.3s"
      overflow="hidden"
      px={4}
      py={6}
      role="navigation"
    >
      <Text fontSize="xl" fontWeight="bold" mb={6}>
        Expediente Luna
      </Text>

      {usuario && (
        <Box mb={6}>
          <Text fontSize="sm">{usuario.correo}</Text>
          <Text fontSize="xs" color="gray.400">
            Rol: {usuario.rol}
          </Text>
        </Box>
      )}

      <VStack align="stretch" gap={2}>
        {seccionesVisibles.map((item) => (
          <ChakraLink
            key={item.href}
            as={NextLink}
            href={item.href}
            _hover={{ textDecoration: 'none' }}
          >
            <Button
              justifyContent="start"
              colorScheme="gray"
              variant="ghost"
              w="full"
              onClick={() => setSidebarOpen(false)}
            >
              <Icon as={item.icon} mr={2} />
              {item.label}
            </Button>
          </ChakraLink>
        ))}

        <Button
          aria-label="Cerrar sesión"
          colorScheme="red"
          variant="ghost"
          onClick={logout}
          w="full"
          justifyContent="start"
        >
          <Icon as={LuLogOut} mr={2} />
          Cerrar sesión
        </Button>
      </VStack>
    </Box>
  )
}