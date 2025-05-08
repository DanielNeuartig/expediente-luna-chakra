export const MENSAJES = {
  nombreIncompleto: 'El nombre debe contener al menos dos palabras',
  telefonoSecundarioInvalido: 'Teléfonos secundarios inválidos',
  telefonoSecundarioIgual: 'Un teléfono secundario no puede ser igual al principal',
  telefonosIguales: 'Los teléfonos secundarios no pueden ser iguales entre sí',
  codigoIncorrecto: 'Código incorrecto o expirado',
  falloVerificacionCodigo: 'No se pudo verificar el código. Intenta de nuevo.',
  emailInvalido: 'Correo inválido',
  camposIncompletos: 'Completa todos los campos',
  contrasenaCorta: 'La contraseña debe tener al menos 8 caracteres',
  contrasenasNoCoinciden: 'Las contraseñas no coinciden', // ✅ añadido
  propietarioNoRegistrado: 'Tu cuenta aún no tiene un perfil de propietario registrado.',
  usuarioInactivo: 'Este usuario está inactivo. Contacta con el administrador.',
  usuarioNoExiste: 'No existe un usuario con ese correo',
  contrasenaIncorrecta: 'Contraseña incorrecta',
  usuarioYaExiste: 'Este correo ya está registrado', // ✅ añadido
  rolInvalido: 'Rol no permitido',
  registroExitoso: 'Usuario registrado correctamente',
  inicioSesionExitoso: 'Sesión iniciada correctamente',
  errorConexion: 'Error de conexión',
  errorInterno: 'Error interno del servidor',
  tokenFaltante: 'Token no proporcionado.',
  tokenInvalido: 'Token inválido.',
  yaTienePropietario: 'Ya tienes un propietario registrado',
  telefonoInvalido: 'Teléfono inválido. Usa formato internacional, por ejemplo: +521234567890.',
  telefonoYaRegistrado: 'Este teléfono ya está registrado como principal por otro propietario.',
  demasiadosIntentos: 'Demasiadas solicitudes desde esta IP. Intenta más tarde.',
  falloEnvioSMS: 'No se pudo enviar el SMS',
  nombreInvalido: 'El nombre solo puede contener letras y espacios'
}
export function validarEmail(correo: string): boolean {
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:(?!.*\.\.)[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/
  return regex.test(correo.trim())
}
export function formatearTelefonoVisual(numero: string): string {
  const solo10 = numero.replace(/\D/g, '').slice(0, 10)
  return solo10.replace(/(\d{2})(?=\d)/g, '$1 ').trim()
}
export function esTelefonoValido(identificador: string): boolean {
  if (!identificador.startsWith('+')) return false
  const match = identificador.match(/^\+(\d{1,4})(\d{10})$/)
  return !!match
}