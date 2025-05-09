'use client'

import {
  Box,
  Button,
  Flex,
  Icon,
  Text,
  VStack,
} from '@chakra-ui/react'
import { LuLogOut, LuLayoutDashboard, LuMenu } from 'react-icons/lu'
import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'
import NextLink from 'next/link'

const menu = [
  {
    label: 'Inicio',
    href: '/dashboard',
    icon: LuLayoutDashboard,
    roles: ['CEO', 'ADMIN', 'MEDICO', 'AUXILIAR'],
  },
  // Puedes agregar más rutas aquí según el rol
]

export default function DashboardPage() {
  const { usuario, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const seccionesVisibles = menu.filter((item) =>
    usuario ? item.roles.includes(usuario.rol) : false
  )

  return (
    <Flex h="100vh" w="100vw" overflow="hidden">
      {/* Sidebar */}
      <Box
        as="nav"
        w={{ base: sidebarOpen ? '200px' : '0', md: '200px' }}
        bg="gray.800"
        color="white"
        transition="width 0.3s"
        overflow="hidden"
        px={4}
        py={6}
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
            <NextLink key={item.href} href={item.href} passHref>
              <Button
                as="a"
                justifyContent="start"
                colorScheme="gray"
                variant="ghost"
                w="full"
                onClick={() => setSidebarOpen(false)}
              >
                <Icon as={item.icon} mr={2} />
                {item.label}
              </Button>
            </NextLink>
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

      {/* Main content */}
      <Box flex="1" p={6}>
        <Button
          aria-label="Abrir menú"
          variant="ghost"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          mb={4}
          display={{ base: 'inline-flex', md: 'none' }}
          justifyContent="start"
        >
          <Icon as={LuMenu} mr={2} />
          Menú
        </Button>

        <Text fontSize="2xl" fontWeight="bold">
          Bienvenido al dashboard
        </Text>
        <Text color="gray.600">Selecciona una opción del menú</Text>
      </Box>
    </Flex>
  )
}