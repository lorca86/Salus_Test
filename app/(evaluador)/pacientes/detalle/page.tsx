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
import type { Assessment, Patient, Result } from "@/lib/types";

function DetallePacienteContenido() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";

  const [paciente, setPaciente] = useState<Patient | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [resultados, setResultados] = useState<Result[]>([]);

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
        <Button onClick={() => (window.location.href = `/asignaciones/?patientId=${paciente.id}`)}>
          Asignar prueba
        </Button>
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
