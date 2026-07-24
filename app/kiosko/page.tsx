"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { KioskLock } from "@/components/kiosk/KioskLock";
import { Card } from "@/components/ui/Card";
import { obtenerPaciente } from "@/lib/patients";
import { kioscoBloqueado, obtenerEvaluadorKiosco } from "@/lib/kiosk";
import type { Assessment, Patient } from "@/lib/types";
import { Tablet } from "lucide-react";

interface PendienteTablet {
  assessment: Assessment;
  paciente: Patient | null;
}

export default function KioskoHomePage() {
  const [bloqueado, setBloqueado] = useState(true);
  const [pendientes, setPendientes] = useState<PendienteTablet[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setBloqueado(kioscoBloqueado());
  }, []);

  useEffect(() => {
    if (bloqueado) return;
    void cargarPendientes();
  }, [bloqueado]);

  async function cargarPendientes() {
    setCargando(true);
    const uid = obtenerEvaluadorKiosco();
    if (!uid) {
      setCargando(false);
      return;
    }
    const q = query(
      collection(db, "assessments"),
      where("evaluadorId", "==", uid),
      where("modalidad", "==", "tablet"),
      where("estado", "in", ["pendiente", "en_proceso"])
    );
    const snap = await getDocs(q);
    const items = await Promise.all(
      snap.docs.map(async (d) => {
        const assessment = d.data() as Assessment;
        const paciente = await obtenerPaciente(assessment.patientId);
        return { assessment, paciente };
      })
    );
    setPendientes(items);
    setCargando(false);
  }

  if (bloqueado) {
    return <KioskLock motivo="inicial" onDesbloquear={() => setBloqueado(false)} />;
  }

  return (
    <div className="min-h-screen bg-clinical-slate-50 px-6 py-10">
      <div className="mx-auto max-w-2xl text-center">
        <Tablet className="mx-auto mb-3 h-10 w-10 text-clinical-blue-600" />
        <h1 className="text-2xl font-semibold text-clinical-slate-800">Modo Tablet / Consultorio</h1>
        <p className="mt-1 text-clinical-slate-500">
          Seleccione la evaluación pendiente para iniciar la prueba.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-2xl space-y-3">
        {cargando && <p className="text-center text-clinical-slate-400">Cargando…</p>}
        {!cargando && pendientes.length === 0 && (
          <p className="text-center text-clinical-slate-400">
            No hay evaluaciones asignadas a esta tablet por el momento.
          </p>
        )}
        {pendientes.map(({ assessment, paciente }) => (
          <a key={assessment.id} href={`/kiosko/prueba/?id=${assessment.id}`}>
            <Card className="flex items-center justify-between hover:border-clinical-blue-300">
              <div>
                <p className="font-medium text-clinical-slate-800">
                  {paciente?.nombreCompleto ?? "Paciente"}
                </p>
                <p className="text-sm text-clinical-slate-500">
                  Estado: {assessment.estado === "en_proceso" ? "En proceso" : "Pendiente"}
                </p>
              </div>
              <span className="text-sm font-medium text-clinical-blue-600">Iniciar →</span>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
