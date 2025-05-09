'use client'

import { usePathname, notFound } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Box, Button, Flex, Icon } from '@chakra-ui/react'
import Sidebar from '@/components/Sidebar'
import { useState } from 'react'
import { LuMenu } from 'react-icons/lu'
import { SECCIONES_APP } from '@/lib/seccionesApp'
import type { Rol } from '@/tipos/roles'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { usuario } = useAuth()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const seccion = SECCIONES_APP.find((s) => pathname.startsWith(s.href))
const tienePermiso = usuario && seccion?.roles.includes(usuario.rol as Rol)

  if (!usuario) return null
  if (!tienePermiso) return notFound()

  return (
    <Flex h="100vh" w="100vw" overflow="hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <Box as="main" flex="1" p={6} overflowY="auto" h="100vh" w="100%">
        <Box display={{ base: 'inline-flex', md: 'none' }} mb={4}>
          <Button
            aria-label="Abrir menú"
            variant="ghost"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            display={{ base: 'inline-flex', md: 'none' }}
            maxW="full"
            overflow="hidden"
            textOverflow="ellipsis"
            justifyContent="start"
          >
            <Icon as={LuMenu} mr={2} />
            Menú
          </Button>
        </Box>
        {children}
      </Box>
    </Flex>
  )
}