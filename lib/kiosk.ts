// Estado transitorio del Modo Kiosco. Se guarda en sessionStorage (no en
// Firestore ni en localStorage persistente) porque es únicamente un candado
// de navegación local a la tablet: se pierde al cerrar el navegador y nunca
// contiene datos clínicos.
//
// Importante: el "bloqueo de kiosco" es solo un candado de UI/navegación.
// El evaluador inicia sesión de Firebase Auth UNA VEZ en la tablet
// ("Configurar esta tablet", ver app/(evaluador)/configuracion) y esa
// sesión persiste en el dispositivo (IndexedDB) incluso mientras la tablet
// está bloqueada — por eso `/kiosko` puede seguir leyendo Firestore como
// ese evaluador. El único flujo verdaderamente SIN sesión de Firebase Auth
// es `/remoto` (enlace del paciente en su propio dispositivo), por lo que
// las reglas de Firestore (firestore.rules) tratan ambos casos distinto.

const CLAVE_BLOQUEO = "salus_kiosk_locked";
const CLAVE_EVALUADOR = "salus_kiosk_evaluador_uid";

export function bloquearKiosco(): void {
  sessionStorage.setItem(CLAVE_BLOQUEO, "1");
}

export function desbloquearKiosco(): void {
  sessionStorage.removeItem(CLAVE_BLOQUEO);
}

export function kioscoBloqueado(): boolean {
  if (typeof window === "undefined") return true;
  return sessionStorage.getItem(CLAVE_BLOQUEO) === "1";
}

export function configurarEvaluadorKiosco(uid: string): void {
  sessionStorage.setItem(CLAVE_EVALUADOR, uid);
}

export function obtenerEvaluadorKiosco(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(CLAVE_EVALUADOR);
}
