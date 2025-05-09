// src/context/AuthContext.tsx
'use client'

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import jwt from 'jsonwebtoken'
import { useRouter, usePathname } from 'next/navigation'

type Usuario = {
  id: number
  rol: string
  correo: string
  propietarioId?: number | null
  propietario?: {
    nombre: string
    telefonoPrincipal: string | null
  }
}

type AuthContextType = {
  usuario: Usuario | null
  token: string | null
  login: (correo: string, contrasena: string) => Promise<void>
  logout: () => void
  refrescarUsuario: () => Promise<void>
  autenticado: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const intervaloRef = useRef<NodeJS.Timeout | null>(null)

  const logout = useCallback(() => {
    localStorage.removeItem('auth')
    setUsuario(null)
    setToken(null)
    if (intervaloRef.current) clearInterval(intervaloRef.current)
    if (pathname !== '/') router.replace('/')
  }, [pathname, router])

  const refrescarUsuario = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch('/api/usuario', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) {
        logout()
        return
      }

      const usuarioActualizado: Usuario = {
        id: data.usuario.id,
        rol: data.usuario.rol,
        correo: data.usuario.correo,
        propietarioId: data.usuario.propietarioId,
        propietario: data.usuario.propietario ?? undefined,
      }

      setUsuario(usuarioActualizado)

      const stored = localStorage.getItem('auth')
      const parsed = stored ? JSON.parse(stored) : {}
      const expiraEn = parsed.expiraEn || Date.now() + 86400000

      localStorage.setItem(
        'auth',
        JSON.stringify({
          token,
          usuario: usuarioActualizado,
          expiraEn,
        })
      )

      if (usuarioActualizado.propietarioId == null && pathname !== '/registro-propietario') {
        router.replace('/registro-propietario')
      }
    } catch (error) {
      console.error('Error al refrescar usuario:', error)
    }
  }, [token, pathname, logout, router])

  useEffect(() => {
    const stored = localStorage.getItem('auth')
    if (stored) {
      const parsed = JSON.parse(stored)
      const now = Date.now()
      if (!parsed.expiraEn || now > parsed.expiraEn) {
        localStorage.removeItem('auth')
        return
      }
      setUsuario(parsed.usuario)
      setToken(parsed.token)
    }
  }, [])

  useEffect(() => {
    if (!usuario) return
    if (usuario.propietarioId == null && pathname !== '/registro-propietario') {
      router.replace('/registro-propietario')
    }
  }, [usuario, pathname, router])

  useEffect(() => {
    if (!token) return
    intervaloRef.current = setInterval(refrescarUsuario, 60000)
    return () => {
      if (intervaloRef.current) clearInterval(intervaloRef.current)
    }
  }, [token, refrescarUsuario])

  const login = async (correo: string, contrasena: string) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contrasena }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Error de inicio de sesión')

    const usuarioLogueado: Usuario = {
      id: data.usuario.id,
      rol: data.usuario.rol,
      correo: data.usuario.correo,
      propietarioId: data.usuario.propietarioId,
      propietario: data.usuario.propietario ?? undefined,
    }

    setUsuario(usuarioLogueado)
    setToken(data.token)

    const decoded = jwt.decode(data.token) as { exp: number }
    const expiraEn = decoded?.exp ? decoded.exp * 1000 : Date.now() + 86400000

    localStorage.setItem(
      'auth',
      JSON.stringify({ token: data.token, usuario: usuarioLogueado, expiraEn })
    )

    if (usuarioLogueado.propietarioId == null) {
      router.replace('/registro-propietario')
    } else {
      router.replace('/dashboard')
    }
  }

  return (
    <AuthContext.Provider
      value={{ usuario, token, login, logout, refrescarUsuario, autenticado: !!usuario }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}