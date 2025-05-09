'use client'

import {
  Box,
  Button,
  Flex,
  Icon,
  Text,
} from '@chakra-ui/react'
import { LuMenu } from 'react-icons/lu'
import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'

export default function DashboardPage() {
  const { usuario } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <Flex h="100vh" w="100%" overflowX="hidden" overflowY="auto">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <Box flex="1" p={6}>
        <Button
          aria-label="Abrir menú"
          variant="ghost"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          mb={4}
          display={{ base: 'inline-flex', md: 'none' }}
          maxW="full"
          overflow="hidden"
          textOverflow="ellipsis"
        >
          <Icon as={LuMenu} mr={2} />
          Menú
        </Button>

        <Text fontSize="2xl" fontWeight="bold">
           Bienvenido{usuario ? `, ${usuario.correo}` : ''} al dashboard
        </Text>
        <Text color="gray.600">Selecciona una opción del menú</Text>
      </Box>
    </Flex>
  )
}