'use client'

import {
  Box,
  Button,
  Input,
  Text,
  VStack,
  Separator,
  HStack,
} from "@chakra-ui/react";
import { useState } from 'react'
import { toaster } from '@/components/ui/toaster'
import { useAuth } from '@/context/AuthContext'

export default function RegistroPropietario() {
  console.log("🟢 Componente RegistroPropietario montado");
  const { usuario, logout } = useAuth();
  const [nombre, setNombre] = useState("");
  const [clavePais, setClavePais] = useState("+52");
  const [telefonoPrincipal, setTelefonoPrincipal] = useState("");
  const [telefonoSecundario1, setTelefonoSecundario1] = useState("");
  const [telefonoSecundario2, setTelefonoSecundario2] = useState("");
  const [codigo, setCodigo] = useState("");
  const [enviandoCodigo, setEnviandoCodigo] = useState(false);
  const [cargando, setCargando] = useState(false);

  const formatearNombre = (valor: string) =>
    valor
      .toLowerCase()
      .replace(/[^a-záéíóúñ\s]/gi, "")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const formatearTelefono = (valor: string) =>
    valor
      .replace(/\D/g, "")
      .slice(0, 10)
      .replace(/(\d{2})(?=\d)/g, "$1 ")
      .trim();

  const validarTelefono = (tel: string) =>
    tel === "" || tel.replace(/\D/g, "").length === 10;

  const telefonoCompleto = () => {
    const clave = clavePais.trim();
    const sinEspacios = telefonoPrincipal.replace(/\D/g, "");
    return `${clave}${sinEspacios}`;
  };

  const enviarCodigo = async () => {
    const claveValida = /^\+\d{1,3}$/.test(clavePais.trim());
    const completo = telefonoCompleto();
    if (!claveValida || !/^\+\d{10,15}$/.test(completo)) {
      toaster.create({
        description:
          "Teléfono inválido. Usa formato internacional, por ejemplo: +521234567890.",
        type: "error",
      });
      return;
    }

    setEnviandoCodigo(true);
    try {
      console.log("[DEBUG] Enviando código SMS a:", completo);
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
      });
      const data = await res.json();
      console.log("[DEBUG] Respuesta de /api/enviar-sms:", data);
      if (!res.ok) throw new Error(data.error || "Error al enviar código");
      toaster.create({
        description: "Código enviado por SMS",
        type: "success",
      });
    } catch (error: any) {
      console.error("[ERROR] al enviar código:", error.message);
      toaster.create({ description: error.message, type: "error" });
    } finally {
      setEnviandoCodigo(false);
    }
  };

  const handleSubmit = async () => {
    console.log("[DEBUG] Intentando enviar registro...");
    console.log("[DEBUG] Nombre:", nombre);
    console.log("[DEBUG] Teléfono principal:", telefonoPrincipal);
    console.log("[DEBUG] Código:", codigo);

    const palabras = nombre.trim().split(/\s+/);
    if (palabras.length < 2 || !validarTelefono(telefonoPrincipal)) {
      console.warn("[DEBUG] Validación fallida: nombre o teléfono");
      toaster.create({
        description:
          "Verifica que el nombre tenga al menos dos palabras y que el teléfono sea válido",
        type: "error",
      });
      return;
    }

    const token = localStorage.getItem("auth")
      ? JSON.parse(localStorage.getItem("auth")!).token
      : "";
    const payload = {
      nombre: nombre.trim(),
      telefonoPrincipal: telefonoCompleto(),
      telefonoSecundario1: telefonoSecundario1.replace(/\D/g, "") || null,
      telefonoSecundario2: telefonoSecundario2.replace(/\D/g, "") || null,
      codigo,
    };

    console.log("[DEBUG] Payload a enviar:", payload);

    setCargando(true);
    try {
      const res = await fetch("/api/registro-propietario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("[DEBUG] Respuesta de /api/registro-propietario:", data);

      if (!res.ok)
        throw new Error(data.error || "Error al registrar propietario");

      toaster.create({ description: "Registro exitoso", type: "success" });
      setNombre("");
      setTelefonoPrincipal("");
      setTelefonoSecundario1("");
      setTelefonoSecundario2("");
      setCodigo("");
      setClavePais("+52");
    } catch (error: any) {
      console.error("[ERROR] al registrar propietario:", error.message);
      toaster.create({ description: error.message, type: "error" });
    } finally {
      setCargando(false);
    }
  };

  return (
    <Box
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
          <Text fontSize="lg" fontWeight="bold">
            ¡Bienvenido!
          </Text>
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
                setTelefonoPrincipal(formatearTelefono(e.target.value))
              }
              placeholder="33 33 33 33 33"
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
            placeholder="123456"
          />
        </Box>

        <Box>
          <Text mb={1}>Teléfono secundario 1 (opcional)</Text>
          <Input
            value={telefonoSecundario1}
            onChange={(e) =>
              setTelefonoSecundario1(formatearTelefono(e.target.value))
            }
            placeholder="33 33 33 33 33"
          />
        </Box>

        <Box>
          <Text mb={1}>Teléfono secundario 2 (opcional)</Text>
          <Input
            value={telefonoSecundario2}
            onChange={(e) =>
              setTelefonoSecundario2(formatearTelefono(e.target.value))
            }
            placeholder="33 33 33 33 33"
          />
        </Box>
        {console.log("⚙️ cargando:", cargando)}
        <Button
          colorScheme="teal"
          onClick={() => {
            console.log("🚀 Botón clickeado");
            handleSubmit();
          }}
          loading={cargando}
          loadingText="Guardando..."
          disabled={cargando}
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
    </Box>
  );
}