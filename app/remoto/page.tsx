"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, Stethoscope } from "lucide-react";
import { TestRunner } from "@/components/kiosk/TestRunner";
import { obtenerAsignacion } from "@/lib/assessments";
import { obtenerTest } from "@/lib/catalog";
import type { Assessment, TestDefinition } from "@/lib/types";

function RemotoContenido() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [datos, setDatos] = useState<{
    assessment: Assessment;
    test: TestDefinition;
  } | null>(null);
  const [completado, setCompletado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pinVerificado, setPinVerificado] = useState(false);
  const [pinIngresado, setPinIngresado] = useState("");
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Enlace inválido.");
      return;
    }
    void cargar();
  }, [token]);

  async function cargar() {
    const assessment = await obtenerAsignacion(token);
    if (!assessment) {
      setError("Este enlace no es válido o ha expirado.");
      return;
    }
    if (assessment.tokenExpiraEn && new Date(assessment.tokenExpiraEn) < new Date()) {
      setError("Este enlace ha expirado. Solicite uno nuevo a su evaluador.");
      return;
    }
    if (assessment.estado === "completado") {
      setCompletado(true);
      return;
    }
    const test = await obtenerTest(assessment.testId);
    if (!test || test.tipo !== "autoinforme") {
      setError("Esta evaluación no está disponible para responder a distancia.");
      return;
    }
    setDatos({ assessment, test });
  }

  function verificarPin(e: React.FormEvent) {
    e.preventDefault();
    if (pinIngresado === datos?.assessment.pinAcceso) {
      setPinVerificado(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6 text-center">
        <p className="text-lg text-red-600">{error}</p>
      </div>
    );
  }

  if (completado) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
        <ShieldCheck className="mb-4 h-16 w-16 text-green-500" />
        <h1 className="text-2xl font-semibold text-clinical-slate-800">Evaluación completada</h1>
        <p className="mt-2 text-clinical-slate-500">Gracias por completar la prueba. Puede cerrar esta ventana.</p>
      </div>
    );
  }

  if (!datos) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white">
        <Stethoscope className="mb-3 h-8 w-8 text-clinical-blue-600" />
        <p className="text-clinical-slate-500">Cargando evaluación…</p>
      </div>
    );
  }

  if (datos.assessment.pinAcceso && !pinVerificado) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
        <ShieldCheck className="mb-4 h-10 w-10 text-clinical-blue-600" />
        <h1 className="mb-2 text-xl font-semibold text-clinical-slate-800">Ingrese su PIN de acceso</h1>
        <p className="mb-4 max-w-sm text-sm text-clinical-slate-500">
          Su evaluador le entregó un código de 4 dígitos para confirmar su identidad antes de iniciar.
        </p>
        <form onSubmit={verificarPin} className="flex flex-col items-center gap-3">
          <input
            autoFocus
            inputMode="numeric"
            maxLength={4}
            value={pinIngresado}
            onChange={(e) => {
              setPinIngresado(e.target.value.replace(/\D/g, ""));
              setPinError(false);
            }}
            className="w-32 rounded-lg border border-clinical-slate-300 px-3 py-2 text-center text-2xl tracking-[0.5em]"
          />
          {pinError && <p className="text-sm text-red-600">PIN incorrecto. Intente de nuevo.</p>}
          <button
            type="submit"
            disabled={pinIngresado.length !== 4}
            className="rounded-lg bg-clinical-blue-600 px-6 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Continuar
          </button>
        </form>
      </div>
    );
  }

  return (
    <TestRunner
      assessment={datos.assessment}
      test={datos.test}
      onCompletado={() => setCompletado(true)}
    />
  );
}

export default function RemotoPage() {
  return (
    <Suspense fallback={null}>
      <RemotoContenido />
    </Suspense>
  );
}
