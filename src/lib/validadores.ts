// src/lib/validadores.ts

export const validarEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export const MENSAJES = {
  emailInvalido: 'Correo inválido',
  camposIncompletos: 'Completa todos los campos',
  contrasenaCorta: 'La contraseña debe tener al menos 8 caracteres',
  usuarioInactivo: 'Este usuario está inactivo. Contacta con el administrador.',
  usuarioNoExiste: 'No existe un usuario con ese correo',
  contrasenaIncorrecta: 'Contraseña incorrecta',
  correoDuplicado: 'Ese correo ya está registrado. Intenta iniciar sesión en su lugar.',
  rolInvalido: 'Rol no permitido',
  registroExitoso: 'Usuario registrado correctamente',
  inicioSesionExitoso: 'Sesión iniciada correctamente',
  errorConexion: 'Error de conexión',
  errorInterno: 'Error interno del servidor',
  tokenFaltante: 'Token no proporcionado.',
tokenInvalido: 'Token inválido.'
}
