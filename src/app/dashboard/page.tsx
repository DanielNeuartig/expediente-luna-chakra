'use client'

import { Box, Heading, Text, Button } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import ProteccionRol from '@/components/ProteccionRol'
import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'

const MotionBox = motion(Box)

export default function DashboardPage() {
  const { logout } = useAuth()
  const [visible, setVisible] = useState(true)
  const { usuario } = useAuth()

const handleLogout = () => {
  logout()            // cierra sesión y redirige
  setVisible(false)   // animación de salida
}

  return (
    <ProteccionRol minimo="AUXILIAR">
      <AnimatePresence>
        {visible && (
          <MotionBox
            p={8}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Heading size="lg" mb={4}>Bienvenido al panelss</Heading>
            <Text mb={6}>Contenido exclusivo para auxiliares y roles superiores.</Text>
            <Button colorScheme="red" onClick={handleLogout}>
              Cerrar sesión
            </Button>
            <Box p={4}>
        {usuario ? (
          <Text fontWeight="bold" color="teal.600">
            Sesión iniciada como: {usuario.correo} (Rol: {usuario.rol})
          </Text>
        ) : (
          <Text color="gray.500">Ningún usuario ha iniciado sesión</Text>
        )}
      </Box>
          </MotionBox>
        )}
      </AnimatePresence>
    </ProteccionRol>
  )
}