// Hash del PIN de seguridad de 4 dígitos del Modo Kiosco.
// Se usa Web Crypto (disponible en navegador y en Node >= 20) para no
// depender de librerías nativas, ya que el PIN se valida tanto en el panel
// del evaluador (al configurarlo) como en la tablet (al desbloquear).

async function sha256Hex(texto: string): Promise<string> {
  const datos = new TextEncoder().encode(texto);
  const hashBuffer = await crypto.subtle.digest("SHA-256", datos);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function esPinValido(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

export async function hashPin(pin: string, salt: string): Promise<string> {
  return sha256Hex(`${salt}:${pin}`);
}

export async function verificarPin(
  pin: string,
  salt: string,
  hashGuardado: string
): Promise<boolean> {
  if (!esPinValido(pin)) return false;
  const hash = await hashPin(pin, salt);
  return hash === hashGuardado;
}
