"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { KioskLock } from "@/components/kiosk/KioskLock";
import { TestRunner } from "@/components/kiosk/TestRunner";
import { obtenerAsignacion } from "@/lib/assessments";
import { obtenerTest } from "@/lib/catalog";
import { kioscoBloqueado } from "@/lib/kiosk";
import type { Assessment, TestDefinition } from "@/lib/types";

function KioskoPruebaContenido() {
  const params = useSearchParams();
  const assessmentId = params.get("id") ?? "";

  const [bloqueado, setBloqueado] = useState(true);
  const [completado, setCompletado] = useState(false);
  const [datos, setDatos] = useState<{
    assessment: Assessment;
    test: TestDefinition;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBloqueado(kioscoBloqueado());
  }, []);

  useEffect(() => {
    if (bloqueado || !assessmentId) return;
    void cargar();
  }, [bloqueado, assessmentId]);

  async function cargar() {
    const assessment = await obtenerAsignacion(assessmentId);
    if (!assessment) {
      setError("No se encontró la evaluación solicitada.");
      return;
    }
    const test = await obtenerTest(assessment.testId);
    if (!test) {
      setError("No se pudo cargar el test.");
      return;
    }
    // Blindaje adicional: nunca ejecutar en tablet/kiosco un test de observación.
    if (test.tipo !== "autoinforme") {
      setError("Este test es de aplicación exclusiva del evaluador y no puede ejecutarse en la tablet.");
      return;
    }
    setDatos({ assessment, test });
  }

  if (bloqueado) {
    return <KioskLock motivo="inicial" onDesbloquear={() => setBloqueado(false)} />;
  }

  if (completado) {
    return <KioskLock motivo="completado" onDesbloquear={() => (window.location.href = "/kiosko/")} />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6 text-center">
        <p className="text-lg text-red-600">{error}</p>
      </div>
    );
  }

  if (!datos) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-clinical-slate-500">Cargando evaluación…</p>
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

export default function KioskoPruebaPage() {
  return (
    <Suspense fallback={null}>
      <KioskoPruebaContenido />
    </Suspense>
  );
}
