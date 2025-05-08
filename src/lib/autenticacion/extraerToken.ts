// src/lib/autenticacion/extraerToken.ts

export function extraerToken(req: Request): string | null {
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null
    return authHeader.split(' ')[1]?.trim() || null
  }