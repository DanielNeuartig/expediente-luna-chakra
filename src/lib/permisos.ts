// src/lib/permisos.ts

import { Rol } from "@/tipos/roles" // Ajusta según dónde declares el enum o tipo de roles

export const PERMISOS_POR_RUTA: Record<string, Rol[]> = {
  "/dashboard": ["CEO", "ADMIN", "MEDICO", "AUXILIAR", "PROPIETARIO"],

  "/dashboard/reporte": ["CEO", "ADMIN", "MEDICO"],

  "/dashboard/propietarios": ["CEO", "ADMIN", "MEDICO", "AUXILIAR"],

  "/dashboard/mascotas": ["CEO", "ADMIN", "MEDICO", "AUXILIAR"],

  "/dashboard/visitas": ["CEO", "ADMIN", "MEDICO", "AUXILIAR"],

  "/dashboard/mis-mascotas": ["PROPIETARIO"],

  "/dashboard/usuario": ["CEO", "ADMIN", "MEDICO", "AUXILIAR", "PROPIETARIO"],

  // Agrega más secciones según necesites
}