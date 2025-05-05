// src/lib/jerarquiaRoles.ts

export const JERARQUIA_ROLES = {
    CEO: 4,
    ADMIN: 3,
    MEDICO: 2,
    AUXILIAR: 1,
    PROPIETARIO: 0,
  } as const
  
  export type RolNombre = keyof typeof JERARQUIA_ROLES