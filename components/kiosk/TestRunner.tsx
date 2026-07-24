"use client";

import { useMemo, useState } from "react";
import { QuestionRenderer } from "@/components/kiosk/QuestionRenderer";
import { Button } from "@/components/ui/Button";
import { guardarRespuesta, finalizarAsignacion } from "@/lib/assessments";
import { bloquearKiosco } from "@/lib/kiosk";
import type { Assessment, TestDefinition } from "@/lib/types";

interface TestRunnerProps {
  assessment: Assessment;
  test: TestDefinition;
  onCompletado: () => void;
}

/**
 * Aplica un test paso a paso dentro del Modo Kiosco (o en modo remoto).
 * Cada respuesta se guarda de inmediato en Firestore (persistencia
 * offline-first vía lib/firebase.ts) para no perder progreso si la tablet
 * pierde conexión. Al terminar la última pregunta, calcula el resultado y
 * bloquea la tablet con PIN.
 */
export function TestRunner({ assessment, test, onCompletado }: TestRunnerProps) {
  const [pasoActual, setPasoActual] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, number | string>>(
    assessment.respuestas ?? {}
  );
  const [guardando, setGuardando] = useState(false);
  const [finalizando, setFinalizando] = useState(false);

  const pregunta = test.preguntas[pasoActual];
  const progreso = useMemo(
    () => Math.round(((pasoActual + 1) / test.preguntas.length) * 100),
    [pasoActual, test.preguntas.length]
  );

  async function responder(valor: number | string) {
    setGuardando(true);
    const nuevasRespuestas = { ...respuestas, [pregunta.id]: valor };
    setRespuestas(nuevasRespuestas);
    try {
      await guardarRespuesta(assessment.id, pregunta.id, valor, assessment.estado);
    } finally {
      setGuardando(false);
    }

    if (pasoActual + 1 < test.preguntas.length) {
      setPasoActual((p) => p + 1);
    } else {
      await finalizar(nuevasRespuestas);
    }
  }

  async function finalizar(respuestasFinales: Record<string, number | string>) {
    setFinalizando(true);
    await finalizarAsignacion(
      { ...assessment, respuestas: respuestasFinales },
      test
    );
    bloquearKiosco();
    onCompletado();
  }

  if (finalizando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-xl text-clinical-slate-600">Guardando resultados…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="h-2 w-full bg-clinical-slate-100">
        <div
          className="h-2 bg-clinical-blue-600 transition-all"
          style={{ width: `${progreso}%` }}
        />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        <span className="mb-6 text-sm font-medium uppercase tracking-wide text-clinical-slate-400">
          {test.nombre} · Pregunta {pasoActual + 1} de {test.preguntas.length}
        </span>
        <QuestionRenderer
          pregunta={pregunta}
          valorSeleccionado={respuestas[pregunta.id]}
          onResponder={responder}
        />
      </div>

      <div className="flex justify-between px-6 py-4">
        <Button
          variant="ghost"
          disabled={pasoActual === 0 || guardando}
          onClick={() => setPasoActual((p) => Math.max(0, p - 1))}
        >
          Anterior
        </Button>
        <span className="self-center text-sm text-clinical-slate-400">
          {guardando ? "Guardando…" : "Progreso guardado"}
        </span>
      </div>
    </div>
  );
}
