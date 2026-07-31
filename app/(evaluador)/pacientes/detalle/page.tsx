"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { obtenerPaciente } from "@/lib/patients";
import { listarResultadosPorPaciente } from "@/lib/results";
import { eliminarAsignacion } from "@/lib/assessments";
import type { Assessment, Patient, Result } from "@/lib/types";
import { Trash2 } from "lucide-react";

function DetallePacienteContenido() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";

  const [paciente, setPaciente] = useState<Patient | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [resultados, setResultados] = useState<Result[]>([]);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    void cargar();
  }, [id]);

  async function cargar() {
    const [p, resultadosPaciente] = await Promise.all([
      obtenerPaciente(id),
      listarResultadosPorPaciente(id),
    ]);
    setPaciente(p);
    setResultados(resultadosPaciente);
    const snap = await getDocs(query(collection(db, "assessments"), where("patientId", "==", id)));
    setAssessments(snap.docs.map((d) => d.data() as Assessment));
  }

  async function eliminar(assessmentId: string) {
    if (!window.confirm("¿Eliminar esta evaluación y su resultado? Esta acción no se puede deshacer.")) {
      return;
    }
    setEliminandoId(assessmentId);
    try {
      await eliminarAsignacion(assessmentId);
      setAssessments((prev) => prev.filter((a) => a.id !== assessmentId));
      setResultados((prev) => prev.filter((r) => r.assessmentId !== assessmentId));
    } finally {
      setEliminandoId(null);
    }
  }

  if (!paciente) return <p className="text-clinical-slate-400">Cargando expediente…</p>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-clinical-slate-800">{paciente.nombreCompleto}</h1>
          <p className="text-sm text-clinical-slate-500">
            {paciente.edad} años · {paciente.sexo} · Nacimiento: {paciente.fechaNacimiento}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => (window.location.href = `/pruebas/?patientId=${paciente.id}`)}
          >
            Aplicar prueba ahora
          </Button>
          <Button onClick={() => (window.location.href = `/asignaciones/?patientId=${paciente.id}`)}>
            Asignar a distancia
          </Button>
        </div>
      </div>

      {paciente.notas && (
        <Card className="mb-6">
          <p className="mb-1 text-sm font-medium text-clinical-slate-700">Notas clínicas</p>
          <p className="text-sm text-clinical-slate-600">{paciente.notas}</p>
        </Card>
      )}

      <h2 className="mb-3 text-lg font-semibold text-clinical-slate-800">Evaluaciones</h2>
      <div className="space-y-2">
        {assessments.map((a) => {
          const resultado = resultados.find((r) => r.assessmentId === a.id);
          return (
            <Card key={a.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-clinical-slate-800">{a.testId}</p>
                <p className="text-sm text-clinical-slate-500">
                  {a.modalidad} · {a.estado}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {resultado && <RiskBadge nivel={resultado.nivelRiesgo} />}
                {a.estado === "completado" && (
                  <a
                    href={`/asignaciones/reporte/?id=${a.id}`}
                    className="text-sm font-medium text-clinical-blue-600"
                  >
                    Ver reporte →
                  </a>
                )}
                <button
                  onClick={() => eliminar(a.id)}
                  disabled={eliminandoId === a.id}
                  title="Eliminar evaluación"
                  className="rounded-md p-1.5 text-clinical-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          );
        })}
        {assessments.length === 0 && (
          <p className="text-clinical-slate-400">Este paciente aún no tiene evaluaciones.</p>
        )}
      </div>
    </div>
  );
}

export default function DetallePacientePage() {
  return (
    <Suspense fallback={null}>
      <DetallePacienteContenido />
    </Suspense>
  );
}
