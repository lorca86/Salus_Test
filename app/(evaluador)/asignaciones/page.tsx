"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/useAuth";
import { listarPacientes } from "@/lib/patients";
import { listarCatalogo } from "@/lib/catalog";
import { crearAsignacion } from "@/lib/assessments";
import { construirEnlaceRemoto } from "@/lib/tokens";
import type { Assessment, ModalidadAplicacion, Patient, TestDefinition } from "@/lib/types";
import { Copy, Check } from "lucide-react";

function AsignacionesContenido() {
  const { usuario } = useAuth();
  const params = useSearchParams();
  const patientIdInicial = params.get("patientId") ?? "";

  const [pacientes, setPacientes] = useState<Patient[]>([]);
  const [catalogo, setCatalogo] = useState<TestDefinition[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  const [patientId, setPatientId] = useState(patientIdInicial);
  const [testId, setTestId] = useState("");
  const [modalidad, setModalidad] = useState<ModalidadAplicacion>("remoto");
  const [enlaceGenerado, setEnlaceGenerado] = useState<{ id: string; url: string } | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [creando, setCreando] = useState(false);

  useEffect(() => {
    if (!usuario) return;
    void Promise.all([listarPacientes(usuario.uid), listarCatalogo(), cargarAssessments(usuario.uid)]).then(
      ([p, c]) => {
        setPacientes(p);
        setCatalogo(c);
        if (!testId && c.length) setTestId(c[0].id);
      }
    );
  }, [usuario]);

  async function cargarAssessments(evaluadorId: string) {
    const snap = await getDocs(query(collection(db, "assessments"), where("evaluadorId", "==", evaluadorId)));
    setAssessments(snap.docs.map((d) => d.data() as Assessment));
  }

  const testSeleccionado = catalogo.find((t) => t.id === testId);

  async function asignar() {
    if (!usuario || !patientId || !testId) return;
    setCreando(true);
    setEnlaceGenerado(null);
    try {
      const test = testSeleccionado!;
      const paciente = pacientes.find((p) => p.id === patientId)!;
      if (test.tipo === "observacion") {
        const assessment = await crearAsignacion({
          testId,
          patientId,
          evaluadorId: usuario.uid,
          modalidad: "tablet", // no aplica, es registro directo del evaluador
          paciente,
        });
        window.location.href = `/observacion/?id=${assessment.id}`;
        return;
      }
      const assessment = await crearAsignacion({
        testId,
        patientId,
        evaluadorId: usuario.uid,
        modalidad,
        paciente,
      });
      if (modalidad === "remoto") {
        setEnlaceGenerado({ id: assessment.id, url: construirEnlaceRemoto(window.location.origin, assessment.id) });
      } else {
        setEnlaceGenerado({ id: assessment.id, url: `${window.location.origin}/kiosko/prueba/?id=${assessment.id}` });
      }
      await cargarAssessments(usuario.uid);
    } finally {
      setCreando(false);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-clinical-slate-800">Evaluaciones</h1>

      <Card className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-clinical-slate-800">Nueva asignación</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-clinical-slate-700">Paciente</label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full rounded-lg border border-clinical-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Seleccione…</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombreCompleto}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-clinical-slate-700">Prueba</label>
            <select
              value={testId}
              onChange={(e) => setTestId(e.target.value)}
              className="w-full rounded-lg border border-clinical-slate-200 px-3 py-2 text-sm"
            >
              {catalogo.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre} {t.tipo === "observacion" ? "(observación clínica)" : ""}
                </option>
              ))}
            </select>
          </div>
          {testSeleccionado?.tipo === "autoinforme" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-clinical-slate-700">Modalidad</label>
              <select
                value={modalidad}
                onChange={(e) => setModalidad(e.target.value as ModalidadAplicacion)}
                className="w-full rounded-lg border border-clinical-slate-200 px-3 py-2 text-sm"
              >
                <option value="remoto">Responder a distancia (enlace único)</option>
                <option value="tablet">Modo Tablet / Consultorio</option>
              </select>
            </div>
          )}
        </div>
        <Button className="mt-4" disabled={!patientId || !testId || creando} onClick={asignar}>
          {creando
            ? "Creando…"
            : testSeleccionado?.tipo === "observacion"
              ? "Iniciar registro clínico"
              : "Crear asignación"}
        </Button>

        {enlaceGenerado && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-clinical-slate-50 p-3 text-sm">
            <span className="flex-1 truncate text-clinical-slate-600">{enlaceGenerado.url}</span>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(enlaceGenerado.url);
                setCopiado(true);
                setTimeout(() => setCopiado(false), 1500);
              }}
              className="rounded-md p-1.5 text-clinical-blue-600 hover:bg-clinical-blue-50"
            >
              {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        )}
      </Card>

      <h2 className="mb-3 text-lg font-semibold text-clinical-slate-800">Todas las evaluaciones</h2>
      <div className="space-y-2">
        {assessments.map((a) => (
          <Card key={a.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-clinical-slate-800">{a.testId}</p>
              <p className="text-sm text-clinical-slate-500">
                {a.modalidad} · {a.estado}
              </p>
            </div>
            {a.estado === "completado" && (
              <a href={`/asignaciones/reporte/?id=${a.id}`} className="text-sm font-medium text-clinical-blue-600">
                Ver reporte →
              </a>
            )}
          </Card>
        ))}
        {assessments.length === 0 && <p className="text-clinical-slate-400">Sin evaluaciones aún.</p>}
      </div>
    </div>
  );
}

export default function AsignacionesPage() {
  return (
    <Suspense fallback={null}>
      <AsignacionesContenido />
    </Suspense>
  );
}
