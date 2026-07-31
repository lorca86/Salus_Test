"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  obtenerAsignacion,
  guardarRespuesta,
  finalizarAsignacion,
  finalizarObservacionPersonalizada,
} from "@/lib/assessments";
import { obtenerTest } from "@/lib/catalog";
import { obtenerPaciente } from "@/lib/patients";
import type { Assessment, Patient, TestDefinition } from "@/lib/types";
import { Eye } from "lucide-react";

function ObservacionContenido() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [test, setTest] = useState<TestDefinition | null>(null);
  const [paciente, setPaciente] = useState<Patient | null>(null);
  const [respuestas, setRespuestas] = useState<Record<string, number | string>>({});
  const [finalizando, setFinalizando] = useState(false);
  const [completado, setCompletado] = useState(false);

  useEffect(() => {
    if (!id) return;
    void cargar();
  }, [id]);

  async function cargar() {
    const a = await obtenerAsignacion(id);
    if (!a) return;
    const [t, p] = await Promise.all([obtenerTest(a.testId), obtenerPaciente(a.patientId)]);
    setAssessment(a);
    setTest(t);
    setPaciente(p);
    setRespuestas(a.respuestas ?? {});
  }

  async function calificar(preguntaId: string, valor: number) {
    if (!assessment) return;
    setRespuestas((prev) => ({ ...prev, [preguntaId]: valor }));
    await guardarRespuesta(assessment.id, preguntaId, valor, assessment.estado);
  }

  async function finalizar() {
    if (!assessment || !test || !paciente) return;
    setFinalizando(true);
    try {
      if (test.algoritmoCalculo === "personalizado") {
        await finalizarObservacionPersonalizada({ ...assessment, respuestas }, test, paciente);
      } else {
        await finalizarAsignacion({ ...assessment, respuestas }, test);
      }
      setCompletado(true);
    } finally {
      setFinalizando(false);
    }
  }

  if (!assessment || !test || !paciente) return <p className="text-clinical-slate-400">Cargando…</p>;

  const dominios = test.dominios ?? ["total"];
  const completo = test.preguntas.every((p) => respuestas[p.id] !== undefined);

  if (completado) {
    return (
      <Card className="mx-auto max-w-lg text-center">
        <p className="mb-2 text-lg font-semibold text-clinical-slate-800">Registro guardado</p>
        <p className="mb-4 text-sm text-clinical-slate-500">El resultado ya está disponible en el reporte.</p>
        <Button onClick={() => (window.location.href = `/asignaciones/reporte/?id=${assessment.id}`)}>
          Ver reporte
        </Button>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Eye className="h-6 w-6 text-clinical-blue-600" />
        <div>
          <h1 className="text-2xl font-semibold text-clinical-slate-800">{test.nombre}</h1>
          <p className="text-sm text-clinical-slate-500">
            Registro clínico directo · {paciente.nombreCompleto}
          </p>
        </div>
      </div>

      {dominios.map((dominio) => (
        <Card key={dominio} className="mb-4">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-clinical-slate-500">
            {dominio}
          </p>
          <div className="space-y-4">
            {test.preguntas
              .filter((p) => (p.dominio ?? "total") === dominio)
              .map((pregunta) => (
                <div key={pregunta.id}>
                  <p className="mb-2 text-sm text-clinical-slate-700">{pregunta.texto}</p>
                  <div className="flex gap-2">
                    {pregunta.opciones.map((opcion) => (
                      <button
                        key={String(opcion.valor)}
                        onClick={() => calificar(pregunta.id, Number(opcion.valor))}
                        className={`rounded-lg border px-3 py-1.5 text-sm ${
                          respuestas[pregunta.id] === opcion.valor
                            ? "border-clinical-blue-600 bg-clinical-blue-50 text-clinical-blue-700"
                            : "border-clinical-slate-200 text-clinical-slate-600"
                        }`}
                      >
                        {opcion.etiqueta}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </Card>
      ))}

      <Button disabled={!completo || finalizando} onClick={finalizar}>
        {finalizando ? "Calculando…" : "Finalizar y calcular resultado"}
      </Button>
    </div>
  );
}

export default function ObservacionPage() {
  return (
    <Suspense fallback={null}>
      <ObservacionContenido />
    </Suspense>
  );
}
