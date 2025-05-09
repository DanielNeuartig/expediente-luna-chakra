// src/components/TarjetaBase.tsx
'use client'

import { Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

export default function TarjetaBase({ children }: { children: React.ReactNode }) {
  return (
    <MotionBox
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      maxW="sm"
      w="100%"
      mx="auto"
      mt={10}
      p={6}
      borderWidth={1}
      borderRadius="xl"
      boxShadow="md"
    >
      {children}
    </MotionBox>
  )
}