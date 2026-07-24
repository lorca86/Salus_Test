"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/lib/useAuth";
import { ClipboardList, Clock, CheckCircle2, Users } from "lucide-react";

interface Resumen {
  activas: number;
  pendientes: number;
  completadasRecientes: number;
  pacientes: number;
}

export default function DashboardPage() {
  const { usuario } = useAuth();
  const [resumen, setResumen] = useState<Resumen | null>(null);

  useEffect(() => {
    if (!usuario) return;
    void cargarResumen(usuario.uid);
  }, [usuario]);

  async function cargarResumen(evaluadorId: string) {
    const assessmentsRef = collection(db, "assessments");
    const [enProceso, pendientes, completadas, pacientes] = await Promise.all([
      getDocs(query(assessmentsRef, where("evaluadorId", "==", evaluadorId), where("estado", "==", "en_proceso"))),
      getDocs(query(assessmentsRef, where("evaluadorId", "==", evaluadorId), where("estado", "==", "pendiente"))),
      getDocs(query(assessmentsRef, where("evaluadorId", "==", evaluadorId), where("estado", "==", "completado"))),
      getDocs(query(collection(db, "patients"), where("evaluadorId", "==", evaluadorId))),
    ]);
    setResumen({
      activas: enProceso.size,
      pendientes: pendientes.size,
      completadasRecientes: completadas.size,
      pacientes: pacientes.size,
    });
  }

  const tarjetas = [
    { label: "Evaluaciones activas", valor: resumen?.activas, icon: Clock, color: "text-amber-600 bg-amber-50" },
    { label: "Pendientes", valor: resumen?.pendientes, icon: ClipboardList, color: "text-clinical-blue-600 bg-clinical-blue-50" },
    { label: "Resultados recientes", valor: resumen?.completadasRecientes, icon: CheckCircle2, color: "text-green-600 bg-green-50" },
    { label: "Pacientes registrados", valor: resumen?.pacientes, icon: Users, color: "text-clinical-slate-600 bg-clinical-slate-100" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-clinical-slate-800">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tarjetas.map(({ label, valor, icon: Icon, color }) => (
          <Card key={label}>
            <div className={`mb-3 inline-flex rounded-lg p-2 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-3xl font-semibold text-clinical-slate-800">{valor ?? "—"}</p>
            <p className="text-sm text-clinical-slate-500">{label}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
