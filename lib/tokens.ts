import { customAlphabet } from "nanoid";

// Alfabeto sin caracteres ambiguos (0/O, 1/l/I) para tokens que a veces se
// leen/transcriben manualmente.
const alfabeto = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz";
const generar = customAlphabet(alfabeto, 24);

export function generarTokenAcceso(): string {
  return generar();
}

export function construirEnlaceRemoto(origen: string, assessmentId: string): string {
  return `${origen}/remoto/?token=${assessmentId}`;
}
