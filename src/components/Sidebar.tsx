'use client'

import { Box, Button, Icon, Text, VStack, Link } from '@chakra-ui/react'
import { LuLogOut, LuLayoutDashboard, LuUser } from 'react-icons/lu'
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
    {
      label: 'Mi perfil',
      href: '/dashboard/usuario',
      icon: LuUser,
      roles: ['CEO', 'ADMIN', 'MEDICO', 'AUXILIAR', 'PROPIETARIO'],
    },
  ]

  const seccionesVisibles = menu.filter((item) =>
    usuario ? item.roles.includes(usuario.rol) : false
  )

  return (
    <Box
      as="nav"
      id="sidebar"
      w={{ base: '200px', md: '200px' }}
      display={{ base: sidebarOpen ? 'block' : 'none', md: 'block' }}
      minW="0"
      bg="gray.800"
      color="white"
      transition="all 0.3s"
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
          <Link
            key={item.href}
            as={NextLink}
            href={item.href}
            style={{ textDecoration: 'none' }}
            onClick={() => setSidebarOpen(false)}
          >
            <Button
              justifyContent="start"
              colorScheme="gray"
              variant="ghost"
              w="full"
            >
              <Icon as={item.icon} mr={2} />
              {item.label}
            </Button>
          </Link>
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