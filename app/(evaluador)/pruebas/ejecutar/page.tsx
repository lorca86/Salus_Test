"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LiveTestRunner } from "@/components/evaluador/LiveTestRunner";
import { useAuth } from "@/lib/useAuth";
import { obtenerTest } from "@/lib/catalog";
import { listarPacientes } from "@/lib/patients";
import type { Patient, TestDefinition } from "@/lib/types";

function EjecutarContenido() {
  const { usuario } = useAuth();
  const params = useSearchParams();
  const testId = params.get("testId") ?? "";
  const patientIdInicial = params.get("patientId") ?? undefined;

  const [test, setTest] = useState<TestDefinition | null>(null);
  const [pacientes, setPacientes] = useState<Patient[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!usuario || !testId) return;
    obtenerTest(testId).then((t) => {
      if (!t) {
        setError("No se encontró la prueba solicitada.");
        return;
      }
      if (t.tipo !== "autoinforme") {
        setError("Esta prueba es de observación clínica; inícala desde el catálogo.");
        return;
      }
      setTest(t);
    });
    // La lista de pacientes es secundaria (solo para adjuntar/guardar): si
    // falla, la prueba debe poder correr igual, sin paciente.
    listarPacientes(usuario.uid)
      .then(setPacientes)
      .catch((err) => console.error("Error al cargar pacientes:", err));
  }, [usuario, testId]);

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!test || !usuario) {
    return <p className="text-clinical-slate-400">Cargando prueba…</p>;
  }

  return (
    <LiveTestRunner
      test={test}
      evaluadorId={usuario.uid}
      pacientes={pacientes}
      patientIdInicial={patientIdInicial}
      onSalir={() => (window.location.href = "/pruebas/")}
    />
  );
}

export default function EjecutarPage() {
  return (
    <Suspense fallback={null}>
      <EjecutarContenido />
    </Suspense>
  );
}
