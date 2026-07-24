"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/lib/useAuth";
import { listarPacientes } from "@/lib/patients";
import { listarCatalogo } from "@/lib/catalog";
import { crearAsignacion } from "@/lib/assessments";
import type { Patient, TestDefinition } from "@/lib/types";
import { ClipboardList, Eye, Loader2 } from "lucide-react";

function CatalogoContenido() {
  const { usuario } = useAuth();
  const params = useSearchParams();
  const patientIdInicial = params.get("patientId") ?? "";

  const [pacientes, setPacientes] = useState<Patient[]>([]);
  const [catalogo, setCatalogo] = useState<TestDefinition[]>([]);
  const [patientId, setPatientId] = useState(patientIdInicial);
  const [creandoObservacion, setCreandoObservacion] = useState<string | null>(null);

  useEffect(() => {
    if (!usuario) return;
    void Promise.all([listarPacientes(usuario.uid), listarCatalogo()]).then(([p, c]) => {
      setPacientes(p);
      setCatalogo(c);
    });
  }, [usuario]);

  const pacienteSeleccionado = pacientes.find((p) => p.id === patientId) ?? null;

  async function iniciarObservacion(test: TestDefinition) {
    if (!usuario || !pacienteSeleccionado) return;
    setCreandoObservacion(test.id);
    try {
      const assessment = await crearAsignacion({
        testId: test.id,
        patientId: pacienteSeleccionado.id,
        evaluadorId: usuario.uid,
        modalidad: "presencial",
        paciente: pacienteSeleccionado,
      });
      window.location.href = `/observacion/?id=${assessment.id}`;
    } finally {
      setCreandoObservacion(null);
    }
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-clinical-slate-800">Catálogo de pruebas</h1>
      <p className="mb-6 text-sm text-clinical-slate-500">
        Elige un paciente (opcional) y luego una prueba para aplicarla ahora mismo, aquí en tu panel.
      </p>

      <Card className="mb-6">
        <label className="mb-1 block text-sm font-medium text-clinical-slate-700">
          Paciente para esta sesión
        </label>
        <select
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-clinical-slate-200 px-3 py-2 text-sm"
        >
          <option value="">Sin paciente (solo ver resultado, no se guarda)</option>
          {pacientes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombreCompleto}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-clinical-slate-400">
          Si no eliges paciente ahora, en autoinformes igual podrás adjuntarlo al terminar, antes de
          guardar. Las pruebas de observación sí requieren paciente para iniciar.
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {catalogo.map((test) => {
          const esObservacion = test.tipo === "observacion";
          const deshabilitada = esObservacion && !pacienteSeleccionado;
          return (
            <Card key={test.id} className="flex flex-col justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  {esObservacion ? (
                    <Eye className="h-4 w-4 text-clinical-blue-600" />
                  ) : (
                    <ClipboardList className="h-4 w-4 text-clinical-blue-600" />
                  )}
                  <p className="font-medium text-clinical-slate-800">{test.nombre}</p>
                </div>
                <p className="mb-4 text-sm text-clinical-slate-500">
                  {esObservacion ? "Observación clínica (solo evaluador)" : "Autoinforme"}
                  {test.tiempoLimiteMin ? ` · ~${test.tiempoLimiteMin} min` : ""}
                </p>
              </div>
              {esObservacion ? (
                <button
                  disabled={deshabilitada || creandoObservacion === test.id}
                  onClick={() => iniciarObservacion(test)}
                  className="rounded-lg bg-clinical-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-clinical-blue-700 disabled:opacity-40"
                  title={deshabilitada ? "Selecciona un paciente arriba primero" : undefined}
                >
                  {creandoObservacion === test.id ? (
                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                  ) : (
                    "Iniciar registro"
                  )}
                </button>
              ) : (
                <a
                  href={`/pruebas/ejecutar/?testId=${test.id}${patientId ? `&patientId=${patientId}` : ""}`}
                  className="rounded-lg bg-clinical-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-clinical-blue-700"
                >
                  Aplicar ahora
                </a>
              )}
            </Card>
          );
        })}
        {catalogo.length === 0 && (
          <p className="text-clinical-slate-400">
            El catálogo está vacío. Corre <code>npm run seed</code> para cargarlo.
          </p>
        )}
      </div>
    </div>
  );
}

export default function CatalogoPage() {
  return (
    <Suspense fallback={null}>
      <CatalogoContenido />
    </Suspense>
  );
}
