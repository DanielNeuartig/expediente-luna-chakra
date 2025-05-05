import { Box } from "@chakra-ui/react";
import Image from "next/image";
import LoginForm from '@/components/LoginForm'
import RegistroUsuario from '@/components/RegistroUsuarioForm'
import { AuthProvider } from '@/context/AuthContext'

export default function HomePage() {
  return (
    <main>
      <h1>Bienvenido a Expediente Luna</h1>
      <p>Selecciona una opción para continuar.</p>

      <RegistroUsuario />
      <LoginForm/>
    </main>
  )
}
