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

  const handleLogout = () => {
    setVisible(false)
    setTimeout(() => logout(), 400) // espera a que termine la animación
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
            <Heading size="lg" mb={4}>Bienvenido al panel</Heading>
            <Text mb={6}>Contenido exclusivo para auxiliares y roles superiores.</Text>
            <Button colorScheme="red" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </MotionBox>
        )}
      </AnimatePresence>
    </ProteccionRol>
  )
}