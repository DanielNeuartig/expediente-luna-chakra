'use client'

import {
  Box,
  Flex,
  Text,
  IconButton,
  VStack,
  Link as ChakraLink,
} from '@chakra-ui/react'
import { LuLogOut, LuLayoutDashboard } from 'react-icons/lu'
import { useAuth } from '@/context/AuthContext'
//import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const MotionBox = motion(Box)

export default function DashboardPage() {
  const { usuario, logout } = useAuth()
  //const router = useRouter()
  const [visible/*, setVisible*/] = useState(true)

  /*const handleLogout = () => {
    setVisible(false)
    setTimeout(() => logout(), 400)
  }*/

  const menu = [
    {
      label: 'Inicio',
      href: '/dashboard',
      icon: <LuLayoutDashboard />,
      roles: ['CEO', 'ADMIN', 'MEDICO', 'AUXILIAR'],
    },
    // Agrega más secciones según el rol...
  ]

  const seccionesVisibles = menu.filter((item) =>
    usuario ? item.roles.includes(usuario.rol) : false
  )

  return (
<Flex h="100vh" w="100vw" overflowX="hidden">
      {/* Sidebar */}
      <Box
        w="150px"
        bg="gray.900"
        p={4}
        boxShadow="md"
        borderRight="1px solid"
        borderColor="gray.100"
      >
        <Text fontSize="xl" fontWeight="bold" mb={6} color="white">
          Menú
        </Text>
        <VStack align="start">
          {seccionesVisibles.map((item) => (
            <ChakraLink
              key={item.href}
              href={item.href}
              px={3}
              py={2}
              rounded="md"
              _hover={{ bg: 'gray.300' }}
              display="flex"
              alignItems="center"
              gap={2}
            >
              {item.icon}
              <Text>{item.label}</Text>
            </ChakraLink>
          ))}
        </VStack>
      </Box>

      {/* Main */}
      <AnimatePresence>
        {visible && (
          <MotionBox
            flex="1"
            p={8}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Flex justify="space-between" align="center" mb={6}>
              <Box>
                <Text fontSize="2xl" fontWeight="bold">
                  Bienvenido al panel
                </Text>
                <Text color="gray.600">
                  {usuario?.correo} ({usuario?.rol})
                </Text>
              </Box>
              <IconButton
  aria-label="Cerrar sesión"
  variant="ghost"
  colorScheme="red"
  onClick={logout}
>
  <LuLogOut />
</IconButton>
            </Flex>

            <Text>Selecciona una sección del menú para comenzar.</Text>
          </MotionBox>
        )}
      </AnimatePresence>
    </Flex>
  )
}