import { customAlphabet } from "nanoid";

// Alfabeto sin caracteres ambiguos (0/O, 1/l/I) para tokens que a veces se
// leen/transcriben manualmente.
const alfabeto = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz";
const generar = customAlphabet(alfabeto, 24);

export function generarTokenAcceso(): string {
  return generar();
}

// PIN corto (4 dígitos) que se entrega por un canal aparte del enlace (p.
// ej. por teléfono) para que el paciente confirme su identidad antes de ver
// la prueba. No sustituye al token del enlace como credencial real — el
// token largo sigue siendo lo único que impide adivinar o listar el
// assessment — pero añade una fricción intencional en la UI.
const generarNumerico = customAlphabet("0123456789", 4);

export function generarPinAcceso(): string {
  return generarNumerico();
}

export function construirEnlaceRemoto(origen: string, assessmentId: string): string {
  return `${origen}/remoto/?token=${assessmentId}`;
}
