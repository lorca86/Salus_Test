"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { QuestionRenderer } from "@/components/kiosk/QuestionRenderer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { crearYFinalizarAplicacionDirecta } from "@/lib/assessments";
import {
  calcularPercentiles,
  calcularPuntuacionesDirectas,
  determinarNivelRiesgo,
} from "@/lib/scoring/engine";
import type { NormativeTable, Patient, Result, TestDefinition } from "@/lib/types";
import { CheckCircle2 } from "lucide-react";

interface LiveTestRunnerProps {
  test: TestDefinition;
  evaluadorId: string;
  pacientes: Patient[];
  patientIdInicial?: string;
  onSalir: () => void;
}

type Fase = "preguntas" | "resultado" | "guardado";

/**
 * Corre una prueba de autoinforme directamente en el panel del evaluador
 * (sin enlace remoto ni Modo Kiosco). El paciente es opcional: se puede
 * elegir antes de empezar, al terminar (justo antes de guardar), o nunca —
 * en cuyo caso el resultado solo se muestra en pantalla y se descarta.
 */
export function LiveTestRunner({
  test,
  evaluadorId,
  pacientes,
  patientIdInicial,
  onSalir,
}: LiveTestRunnerProps) {
  const [fase, setFase] = useState<Fase>("preguntas");
  const [pasoActual, setPasoActual] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, number | string>>({});
  const [patientId, setPatientId] = useState<string>(patientIdInicial ?? "");
  const [tablas, setTablas] = useState<NormativeTable[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [resultadoGuardado, setResultadoGuardado] = useState<Result | null>(null);

  const pregunta = test.preguntas[pasoActual];
  const progreso = Math.round(((pasoActual + 1) / test.preguntas.length) * 100);
  const pacienteSeleccionado = pacientes.find((p) => p.id === patientId) ?? null;

  useEffect(() => {
    if (fase !== "resultado" || !test.requiereBaremo) return;
    void getDocs(query(collection(db, "normative_tables"), where("testId", "==", test.id))).then(
      (snap) => setTablas(snap.docs.map((d) => d.data() as NormativeTable))
    );
  }, [fase, test.id, test.requiereBaremo]);

  const preview = useMemo(() => {
    const puntuacionesDirectas = calcularPuntuacionesDirectas(test, respuestas);
    const percentiles = pacienteSeleccionado
      ? calcularPercentiles(tablas, test, pacienteSeleccionado, puntuacionesDirectas)
      : {};
    const nivelRiesgo = determinarNivelRiesgo(test, puntuacionesDirectas, percentiles);
    return { puntuacionesDirectas, percentiles, nivelRiesgo };
  }, [test, respuestas, pacienteSeleccionado, tablas]);

  function responder(valor: number | string) {
    const nuevasRespuestas = { ...respuestas, [pregunta.id]: valor };
    setRespuestas(nuevasRespuestas);
    if (pasoActual + 1 < test.preguntas.length) {
      setPasoActual((p) => p + 1);
    } else {
      setFase("resultado");
    }
  }

  async function guardar() {
    if (!pacienteSeleccionado) return;
    setGuardando(true);
    try {
      const { resultado } = await crearYFinalizarAplicacionDirecta({
        testId: test.id,
        patientId: pacienteSeleccionado.id,
        evaluadorId,
        respuestas,
        paciente: pacienteSeleccionado,
        test,
      });
      setResultadoGuardado(resultado);
      setFase("guardado");
    } finally {
      setGuardando(false);
    }
  }

  if (fase === "guardado" && resultadoGuardado) {
    return (
      <Card className="mx-auto max-w-lg text-center">
        <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-500" />
        <p className="mb-1 text-lg font-semibold text-clinical-slate-800">
          Resultado guardado en el expediente
        </p>
        <p className="mb-4 text-sm text-clinical-slate-500">{pacienteSeleccionado?.nombreCompleto}</p>
        <div className="flex justify-center gap-2">
          <Button
            variant="secondary"
            onClick={() =>
              (window.location.href = `/asignaciones/reporte/?id=${resultadoGuardado.assessmentId}`)
            }
          >
            Ver reporte
          </Button>
          <Button onClick={onSalir}>Volver al catálogo</Button>
        </div>
      </Card>
    );
  }

  if (fase === "resultado") {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="mb-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-medium text-clinical-slate-800">{test.nombre}</p>
            <RiskBadge nivel={preview.nivelRiesgo} />
          </div>
          <p className="mb-2 text-sm font-medium text-clinical-slate-700">Puntuaciones directas</p>
          <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
            {Object.entries(preview.puntuacionesDirectas).map(([k, v]) => (
              <div key={k} className="flex justify-between rounded-md bg-clinical-slate-50 px-3 py-1.5">
                <span className="text-clinical-slate-500">{k}</span>
                <span className="font-medium text-clinical-slate-800">{v}</span>
              </div>
            ))}
          </div>
          {pacienteSeleccionado && Object.keys(preview.percentiles).length > 0 && (
            <>
              <p className="mb-2 text-sm font-medium text-clinical-slate-700">Percentiles / escalares</p>
              <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
                {Object.entries(preview.percentiles).map(([k, v]) => (
                  <div key={k} className="flex justify-between rounded-md bg-clinical-slate-50 px-3 py-1.5">
                    <span className="text-clinical-slate-500">{k}</span>
                    <span className="font-medium text-clinical-slate-800">{v}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          {!pacienteSeleccionado && test.requiereBaremo && (
            <p className="mb-3 text-xs text-clinical-slate-400">
              Sin paciente asociado no se calculan percentiles/baremos; el nivel de riesgo mostrado es
              aproximado.
            </p>
          )}
        </Card>

        <Card>
          <p className="mb-2 text-sm font-medium text-clinical-slate-700">
            {pacienteSeleccionado
              ? "Guardar en el expediente de:"
              : "Adjuntar a un paciente para guardar (opcional)"}
          </p>
          <select
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="mb-4 w-full rounded-lg border border-clinical-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Sin paciente (no se guardará)</option>
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombreCompleto}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onSalir}>
              Descartar y salir
            </Button>
            <Button disabled={!pacienteSeleccionado || guardando} onClick={guardar}>
              {guardando ? "Guardando…" : "Guardar en expediente"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 h-2 w-full rounded-full bg-clinical-slate-100">
        <div
          className="h-2 rounded-full bg-clinical-blue-600 transition-all"
          style={{ width: `${progreso}%` }}
        />
      </div>
      <p className="mb-6 text-center text-sm font-medium uppercase tracking-wide text-clinical-slate-400">
        {test.nombre} · Pregunta {pasoActual + 1} de {test.preguntas.length}
        {pacienteSeleccionado ? ` · ${pacienteSeleccionado.nombreCompleto}` : " · sin paciente"}
      </p>
      <QuestionRenderer
        pregunta={pregunta}
        valorSeleccionado={respuestas[pregunta.id]}
        onResponder={responder}
      />
      <div className="mt-8 flex justify-between">
        <Button
          variant="ghost"
          disabled={pasoActual === 0}
          onClick={() => setPasoActual((p) => Math.max(0, p - 1))}
        >
          Anterior
        </Button>
        <Button variant="ghost" onClick={onSalir}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
