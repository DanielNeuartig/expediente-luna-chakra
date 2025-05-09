'use client'

import { useAuth } from '@/context/AuthContext'
import { Text, Flex, Icon } from '@chakra-ui/react'
import { LuUser, LuMail, LuShield, LuPhone } from 'react-icons/lu'
import TarjetaBase from './TarjetaBase'

export default function TarjetaPerfilUsuario() {
  const { usuario } = useAuth()

  if (!usuario) return null

  const propietario = usuario.propietario

  return (
    <TarjetaBase>
      <Text fontSize="2xl" fontWeight="bold" mb={6}>
        Información del usuario
      </Text>

      <Flex direction="column" gap={4}>
        <Flex align="center" gap={3}>
          <Icon as={LuMail} />
          <Text>Email: {usuario.correo}</Text>
        </Flex>

        <Flex align="center" gap={3}>
          <Icon as={LuShield} />
          <Text>Rol: {usuario.rol}</Text>
        </Flex>

        {propietario && (
          <>
            <Text fontSize="xl" fontWeight="semibold" mt={6}>
              Información de propietario
            </Text>

            <Flex align="center" gap={3}>
              <Icon as={LuUser} />
              <Text>Nombre: {propietario.nombre || 'No disponible'}</Text>
            </Flex>

            <Flex align="center" gap={3}>
              <Icon as={LuPhone} />
              <Text>
                Teléfono:{' '}
                {propietario.telefonoPrincipal
                  ? propietario.telefonoPrincipal
                  : 'No disponible'}
              </Text>
            </Flex>
          </>
        )}
      </Flex>
    </TarjetaBase>
  )
}