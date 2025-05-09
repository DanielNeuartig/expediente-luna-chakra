// src/lib/seccionesApp.ts
import { LuLayoutDashboard, LuUser } from 'react-icons/lu'
import type { Rol } from '@/tipos/roles'
import type { ComponentType } from 'react'

type Seccion = {
  label: string
  href: string
  icon: ComponentType<{ size?: string | number }>
  roles: Rol[]
  visible?: boolean
  requiereVerificacion?: boolean
}

const TODOS_LOS_ROLES: Rol[] = ['CEO', 'ADMIN', 'MEDICO', 'AUXILIAR', 'PROPIETARIO']

export const SECCIONES_APP: Seccion[] = [
  {
    label: 'Inicio',
    href: '/dashboard',
    icon: LuLayoutDashboard,
    roles: TODOS_LOS_ROLES,
  },
  {
    label: 'Mi perfil',
    href: '/dashboard/usuario',
    icon: LuUser,
    roles: TODOS_LOS_ROLES,
    requiereVerificacion: true,
  },
  // ... más secciones
]

// Validación de rutas duplicadas (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
  const hrefs = SECCIONES_APP.map(s => s.href)
  const duplicados = hrefs.filter((v, i, a) => a.indexOf(v) !== i)
  if (duplicados.length) throw new Error(`Rutas duplicadas en SECCIONES_APP: ${duplicados.join(', ')}`)
}