'use client'

import {
  Box,
  Button,
  Input,
  Text,
  VStack,
  Separator,
  HStack,
} from "@chakra-ui/react"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toaster } from '@/components/ui/toaster'
import { useAuth } from '@/context/AuthContext'
import {
  MENSAJES,
  esTelefonoValido,
  formatearTelefonoVisual,
} from '@/lib/validadores'

const MotionBox = motion(Box)



export default function RegistroPropietario() {
  const router = useRouter()
  const { usuario, logout, refrescarUsuario } = useAuth()
  const [nombre, setNombre] = useState("")
  const [clavePais, setClavePais] = useState("+52")
  const [telefonoPrincipal, setTelefonoPrincipal] = useState("")
  const [telefonoSecundario1, setTelefonoSecundario1] = useState("")
  const [telefonoSecundario2, setTelefonoSecundario2] = useState("")
  const [codigo, setCodigo] = useState("")
  const [enviandoCodigo, setEnviandoCodigo] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [exito, setExito] = useState(false)
  const [shake, setShake] = useState(false)

  const formatearNombre = (valor: string) =>
    valor
      .toLowerCase()
      .replace(/[^a-záéíóúñ\s]/gi, "")
      .replace(/\b\w/g, (c) => c.toUpperCase())

  const telefonoCompleto = () => {
    const clave = clavePais.trim()
    const sinEspacios = telefonoPrincipal.replace(/\D/g, "")
    return `${clave}${sinEspacios}`
  }

  const esFormularioValido = () => {
    const palabras = nombre.trim().split(/\s+/)
    return (
      palabras.length >= 2 &&
      esTelefonoValido(telefonoCompleto()) &&
      codigo.trim().length > 0
    )
  }

  const enviarCodigo = async () => {
    const completo = telefonoCompleto()
    if (!esTelefonoValido(completo)) {
      toaster.create({ description: MENSAJES.telefonoInvalido, type: "error" })
      return
    }

    setEnviandoCodigo(true)
    try {
      const res = await fetch("/api/enviar-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            localStorage.getItem("auth")
              ? JSON.parse(localStorage.getItem("auth")!).token
              : ""
          }`,
        },
        body: JSON.stringify({ telefono: completo }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al enviar código")
      toaster.create({ description: "Código enviado por SMS", type: "success" })
    } catch (error: any) {
      setShake(true)
      setTimeout(() => setShake(false), 600)
      toaster.create({ description: error.message, type: "error" })
    } finally {
      setEnviandoCodigo(false)
    }
  }

  const handleSubmit = async () => {
    if (!esFormularioValido()) {
      setShake(true)
      setTimeout(() => setShake(false), 600)
      toaster.create({
        description: "Verifica que el nombre tenga al menos dos palabras y que el teléfono y código sean válidos",
        type: "error",
      })
      return
    }

    const token = localStorage.getItem("auth")
      ? JSON.parse(localStorage.getItem("auth")!).token
      : ""

    const payload = {
      nombre: nombre.trim(),
      telefonoPrincipal: telefonoCompleto(),
      telefonoSecundario1: telefonoSecundario1.replace(/\D/g, "") || null,
      telefonoSecundario2: telefonoSecundario2.replace(/\D/g, "") || null,
      codigo,
    }

    setCargando(true)
    try {
      const res = await fetch("/api/registro-propietario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok)
        throw new Error(data.error || "Error al registrar propietario")

      toaster.create({ description: "Registro exitoso", type: "success" })
      await refrescarUsuario()
router.push('/dashboard')
      setExito(true)
      setTimeout(() => {
        setNombre("")
        setClavePais("+52")
        setTelefonoPrincipal("")
        setTelefonoSecundario1("")
        setTelefonoSecundario2("")
        setCodigo("")
        setExito(false)
      }, 600)
    } catch (error: any) {
      toaster.create({ description: error.message, type: "error" })
    } finally {
      setCargando(false)
    }
  }

  return (
    <AnimatePresence>
      {!exito && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.4 } }}
          exit={{ opacity: 0, y: -20, transition: { duration: 0.4 } }}
          key="registro-prop"
        >
          <MotionBox
            animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
            maxW="sm"
            mx="auto"
            mt={10}
            p={6}
            borderWidth={1}
            borderRadius="xl"
            boxShadow="md"
          >
            <VStack align="stretch" separator={<Separator />}>
              <Box w="full" textAlign="center">
                <Text fontSize="lg" fontWeight="bold">¡Bienvenido!</Text>
                <Text fontSize="md" color="gray.600">
                  Usuario: {usuario?.id} · Rol: {usuario?.rol}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Correo: {usuario?.correo || "No disponible"}
                </Text>
              </Box>

              <Box>
                <Text mb={1}>Nombre completo</Text>
                <Input
                  value={nombre}
                  onChange={(e) => setNombre(formatearNombre(e.target.value))}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="Nombre y apellido"
                />
              </Box>

              <Box>
                <Text mb={1}>Teléfono principal</Text>
                <HStack>
                  <Input
                    maxW="30%"
                    value={clavePais}
                    onChange={(e) => setClavePais(e.target.value)}
                    placeholder="+52"
                  />
                  <Input
                    flex="1"
                    value={telefonoPrincipal}
                    onChange={(e) =>
                      setTelefonoPrincipal(formatearTelefonoVisual(e.target.value))
                    }
                    placeholder="33 33 33 33 33"
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  />
                  <Button
                    size="sm"
                    onClick={enviarCodigo}
                    loading={enviandoCodigo}
                    disabled={enviandoCodigo}
                  >
                    Enviar código
                  </Button>
                </HStack>
              </Box>

              <Box>
                <Text mb={1}>Código de verificación</Text>
                <Input
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="123456"
                />
              </Box>

              <Box>
                <Text mb={1}>Teléfono secundario 1 (opcional)</Text>
                <Input
                  value={telefonoSecundario1}
                  onChange={(e) =>
                    setTelefonoSecundario1(formatearTelefonoVisual(e.target.value))
                  }
                  placeholder="33 33 33 33 33"
                />
              </Box>

              <Box>
                <Text mb={1}>Teléfono secundario 2 (opcional)</Text>
                <Input
                  value={telefonoSecundario2}
                  onChange={(e) =>
                    setTelefonoSecundario2(formatearTelefonoVisual(e.target.value))
                  }
                  placeholder="33 33 33 33 33"
                />
              </Box>

              <Button
                colorScheme="teal"
                onClick={handleSubmit}
                loading={cargando}
                loadingText="Guardando..."
                disabled={cargando || !esFormularioValido()}
                w="full"
              >
                Concluir registro
              </Button>

              <Button
                colorScheme="red"
                variant="outline"
                onClick={logout}
                disabled={cargando}
                w="full"
              >
                Cerrar sesión
              </Button>
            </VStack>
          </MotionBox>
        </motion.div>
      )}
    </AnimatePresence>
  )
}