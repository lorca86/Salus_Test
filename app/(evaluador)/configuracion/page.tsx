"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/useAuth";
import { crearOActualizarPerfil } from "@/lib/auth";
import { esPinValido, hashPin } from "@/lib/pin";
import { bloquearKiosco, configurarEvaluadorKiosco } from "@/lib/kiosk";
import { nanoid } from "nanoid";

export default function ConfiguracionPage() {
  const { usuario, perfil } = useAuth();
  const [pin, setPin] = useState("");
  const [confirmarPin, setConfirmarPin] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function guardarPin(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario || !perfil) return;
    if (!esPinValido(pin)) {
      setMensaje("El PIN debe tener exactamente 4 dígitos.");
      return;
    }
    if (pin !== confirmarPin) {
      setMensaje("Los PIN no coinciden.");
      return;
    }
    setGuardando(true);
    try {
      const salt = nanoid(16);
      const hash = await hashPin(pin, salt);
      await crearOActualizarPerfil({ ...perfil, pinSalt: salt, pinSeguridad: hash });
      setMensaje("PIN de seguridad actualizado correctamente.");
      setPin("");
      setConfirmarPin("");
    } finally {
      setGuardando(false);
    }
  }

  function configurarEstaTablet() {
    if (!usuario) return;
    configurarEvaluadorKiosco(usuario.uid);
    bloquearKiosco();
    window.location.href = "/kiosko/";
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold text-clinical-slate-800">Configuración</h1>

      <Card>
        <h2 className="mb-1 text-lg font-semibold text-clinical-slate-800">PIN de seguridad del Modo Kiosco</h2>
        <p className="mb-4 text-sm text-clinical-slate-500">
          Este PIN se solicita para desbloquear la tablet después de cada evaluación.
        </p>
        <form onSubmit={guardarPin} className="space-y-3">
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            placeholder="Nuevo PIN (4 dígitos)"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            className="w-full rounded-lg border border-clinical-slate-200 px-3 py-2 text-sm"
          />
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            placeholder="Confirmar PIN"
            value={confirmarPin}
            onChange={(e) => setConfirmarPin(e.target.value.replace(/\D/g, ""))}
            className="w-full rounded-lg border border-clinical-slate-200 px-3 py-2 text-sm"
          />
          {mensaje && <p className="text-sm text-clinical-slate-600">{mensaje}</p>}
          <Button type="submit" disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar PIN"}
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-1 text-lg font-semibold text-clinical-slate-800">Modo Tablet / Consultorio</h2>
        <p className="mb-4 text-sm text-clinical-slate-500">
          Configure este dispositivo como tablet de consultorio vinculada a su cuenta y PIN.
        </p>
        <Button variant="secondary" onClick={configurarEstaTablet}>
          Configurar esta tablet
        </Button>
      </Card>
    </div>
  );
}
