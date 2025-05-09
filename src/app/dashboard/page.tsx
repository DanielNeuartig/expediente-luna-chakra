"use client"

import Link from "next/link"
import { LuLogOut, LuLayoutDashboard } from "react-icons/lu"
import {
  Box,
  Button,
  Flex,
  Icon,
  Stack,
  Text,
} from "@chakra-ui/react"
import { useAuth } from "@/context/AuthContext"

export default function DashboardPage() {
  const { usuario, logout } = useAuth()

  const menu = [
    {
      label: "Inicio",
      href: "/dashboard",
      icon: LuLayoutDashboard,
      roles: ["CEO", "ADMIN", "MEDICO", "AUXILIAR"],
    },
  ]

  const seccionesVisibles = menu.filter((item) =>
    usuario ? item.roles.includes(usuario.rol) : false
  )

  return (
    <Flex h="100dvh">
      {/* Sidebar */}
      <Box w="200px" bg="gray.800" p={4} color="white">
        <Text fontSize="lg" fontWeight="bold" mb={6}>
          Expediente Luna
        </Text>
        <Stack w="full" align="stretch" gap={2}>
          {seccionesVisibles.map((item) => (
            <Link key={item.href} href={item.href}>
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
        </Stack>
      </Box>

      {/* Main content */}
      <Box flex="1" p={8}>
        <Text fontSize="2xl" fontWeight="bold" mb={4}>
          Bienvenido al panel
        </Text>
        <Text color="gray.600">
          {usuario?.correo} ({usuario?.rol})
        </Text>
      </Box>
    </Flex>
  )
}