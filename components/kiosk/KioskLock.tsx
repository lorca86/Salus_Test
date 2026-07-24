"use client";

import { useEffect, useState } from "react";
import { Lock, ShieldCheck, AlertCircle } from "lucide-react";
import { PinPad } from "@/components/kiosk/PinPad";
import { obtenerPerfil } from "@/lib/auth";
import { verificarPin } from "@/lib/pin";
import { desbloquearKiosco, obtenerEvaluadorKiosco } from "@/lib/kiosk";

export type MotivoBloqueo = "completado" | "inicial" | "manual";

interface KioskLockProps {
  motivo: MotivoBloqueo;
  onDesbloquear: () => void;
}

const MAX_INTENTOS = 5;

/**
 * Componente principal del Modo Kiosco.
 *
 * Se monta como overlay de pantalla completa cada vez que la tablet está
 * bloqueada: justo al terminar una prueba, al recargar la página, o cuando
 * el evaluador bloquea manualmente. Mientras está montado el paciente NO
 * tiene forma de navegar a ningún otro sitio de la app (no hay menú, no hay
 * botón de "atrás" útil, y el listener de popstate reemplaza el historial).
 * Solo el PIN de 4 dígitos configurado por el evaluador dueño de la sesión
 * de kiosco lo desmonta.
 */
export function KioskLock({ motivo, onDesbloquear }: KioskLockProps) {
  const [pin, setPin] = useState("");
  const [verificando, setVerificando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intentos, setIntentos] = useState(0);
  const [shake, setShake] = useState(false);

  // Evita que el paciente salga de la pantalla de bloqueo con el botón
  // "atrás" del dispositivo/navegador.
  useEffect(() => {
    history.pushState(null, "", location.href);
    const bloquearRetroceso = () => history.pushState(null, "", location.href);
    window.addEventListener("popstate", bloquearRetroceso);
    return () => window.removeEventListener("popstate", bloquearRetroceso);
  }, []);

  useEffect(() => {
    if (pin.length === 4 && !verificando) {
      void verificar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  async function verificar() {
    setVerificando(true);
    setError(null);
    try {
      const uid = obtenerEvaluadorKiosco();
      if (!uid) {
        setError("Esta tablet no tiene un evaluador configurado. Contacte al administrador.");
        return;
      }
      const perfil = await obtenerPerfil(uid);
      if (!perfil) {
        setError("No se encontró el perfil del evaluador.");
        return;
      }
      const esValido = await verificarPin(pin, perfil.pinSalt, perfil.pinSeguridad);
      if (esValido) {
        desbloquearKiosco();
        onDesbloquear();
        return;
      }
      const nuevosIntentos = intentos + 1;
      setIntentos(nuevosIntentos);
      setShake(true);
      setError(
        nuevosIntentos >= MAX_INTENTOS
          ? "Demasiados intentos fallidos. Solicite ayuda al evaluador."
          : "PIN incorrecto. Intente nuevamente."
      );
      setTimeout(() => setShake(false), 400);
    } finally {
      setPin("");
      setVerificando(false);
    }
  }

  const bloqueadoPorIntentos = intentos >= MAX_INTENTOS;

  return (
    <div className="fixed inset-0 z-50 flex select-none flex-col items-center justify-center bg-clinical-slate-900 px-6 text-white">
      <div className="mb-8 flex flex-col items-center text-center">
        {motivo === "completado" ? (
          <>
            <ShieldCheck className="mb-4 h-16 w-16 text-green-400" />
            <h1 className="text-2xl font-semibold">Evaluación completada con éxito</h1>
            <p className="mt-2 max-w-sm text-clinical-slate-300">
              Gracias por completar la prueba. Entregue la tablet al evaluador para continuar.
            </p>
          </>
        ) : (
          <>
            <Lock className="mb-4 h-16 w-16 text-clinical-slate-400" />
            <h1 className="text-2xl font-semibold">Modo Kiosco bloqueado</h1>
            <p className="mt-2 max-w-sm text-clinical-slate-300">
              Ingrese el PIN de seguridad del evaluador para continuar.
            </p>
          </>
        )}
      </div>

      <div className={shake ? "animate-pulse" : undefined}>
        <PinPad valor={pin} onCambio={setPin} deshabilitado={verificando || bloqueadoPorIntentos} />
      </div>

      <div className="mt-6 h-6 text-sm text-red-400">
        {error && (
          <span className="flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4" /> {error}
          </span>
        )}
      </div>
    </div>
  );
}
