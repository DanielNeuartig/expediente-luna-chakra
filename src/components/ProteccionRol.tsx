'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { Center, Spinner } from '@chakra-ui/react'
import { toaster } from '@/components/ui/toaster'

type Props = {
  children: React.ReactNode
  rolesPermitidos?: string[]
  minimo?: string
  fallback?: React.ReactNode
  publico?: boolean
  uiDenegado?: React.ReactNode
}

const jerarquia = {
  CEO: 4,
  ADMIN: 3,
  MEDICO: 2,
  AUXILIAR: 1,
  PROPIETARIO: 0,
}

export default function ProteccionRol({
  children,
  rolesPermitidos,
  minimo,
  fallback,
  publico = false,
  uiDenegado,
}: Props) {
  const { usuario, autenticado, refrescarUsuario } = useAuth()
  const router = useRouter()
  const [evaluando, setEvaluando] = useState(true)
  const toastMostrado = useRef(false)

  const tienePermiso = () => {
    if (!usuario) return false
    const rolUsuario = usuario.rol
    const nivelUsuario = jerarquia[rolUsuario as keyof typeof jerarquia] ?? -1

    if (rolesPermitidos && !rolesPermitidos.includes(rolUsuario)) return false
    if (minimo && nivelUsuario < jerarquia[minimo as keyof typeof jerarquia]) return false

    return true
  }

  useEffect(() => {
    const verificar = async () => {
      if (!autenticado && !publico) {
        router.replace('/')
        return
      }

      if (autenticado) {
        await refrescarUsuario()

        // Espera a que el usuario esté definido
        if (!usuario) return

        if (usuario.propietarioId == null) {
          router.replace('/registro-propietario')
          return
        }

        if (!tienePermiso()) {
          if (!toastMostrado.current) {
            toaster.create({
              description: 'No tienes permiso para acceder a esta sección.',
              type: 'error',
            })
            toastMostrado.current = true
            setTimeout(() => {
              router.replace('/')
            }, 1500)
          }
        }
      }

      setEvaluando(false)
    }

    verificar()
  }, [autenticado])

  if (evaluando) {
    return fallback || (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  return <>{children}</>
}