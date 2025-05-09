'use client'

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import jwt from 'jsonwebtoken'
import { useRouter, usePathname } from 'next/navigation'

type Usuario = {
  id: number
  rol: string
  correo: string
  propietarioId?: number | null
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
    try {
      if (pathname !== '/') router.replace('/')
    } catch (err) {
      console.error('Error al redirigir durante logout:', err)
    }
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

      if (
        !usuario ||
        usuario.id !== data.usuario.id ||
        usuario.rol !== data.usuario.rol ||
        usuario.correo !== data.usuario.correo ||
        usuario.propietarioId !== data.usuario.propietarioId
      ) {
        setUsuario(data.usuario)
      }

      const stored = localStorage.getItem('auth')
      const parsed = stored ? JSON.parse(stored) : {}
      const expiraEn = parsed.expiraEn || Date.now() + 86400000

      localStorage.setItem(
        'auth',
        JSON.stringify({
          token,
          usuario: data.usuario,
          expiraEn,
        })
      )

      if (data.usuario.propietarioId == null && pathname !== '/registro-propietario') {
        router.replace('/registro-propietario')
      }
    } catch (error) {
      console.error('Error al refrescar usuario:', error)
    }
  }, [token, usuario, pathname, logout, router])

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

    setUsuario(data.usuario)
    setToken(data.token)

    const decoded = jwt.decode(data.token) as { exp: number }
    const expiraEn = decoded?.exp ? decoded.exp * 1000 : Date.now() + 86400000

    localStorage.setItem(
      'auth',
      JSON.stringify({ token: data.token, usuario: data.usuario, expiraEn })
    )

    if (data.usuario.propietarioId == null) {
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