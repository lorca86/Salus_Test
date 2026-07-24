"use client";

import clsx from "clsx";
import type { Pregunta } from "@/lib/types";

interface QuestionRendererProps {
  pregunta: Pregunta;
  valorSeleccionado: number | string | undefined;
  onResponder: (valor: number | string) => void;
}

export function QuestionRenderer({
  pregunta,
  valorSeleccionado,
  onResponder,
}: QuestionRendererProps) {
  const disposicion =
    pregunta.tipo === "likert" || pregunta.tipo === "si_no"
      ? "grid-cols-1 sm:grid-cols-2"
      : "grid-cols-1";

  return (
    <div className="mx-auto w-full max-w-2xl">
      <p className="mb-10 text-center text-2xl font-medium leading-relaxed text-clinical-slate-800">
        {pregunta.texto}
      </p>
      <div className={clsx("grid gap-3", disposicion)}>
        {pregunta.opciones.map((opcion) => {
          const seleccionada = valorSeleccionado === opcion.valor;
          return (
            <button
              key={String(opcion.valor)}
              type="button"
              onClick={() => onResponder(opcion.valor)}
              className={clsx(
                "rounded-2xl border-2 px-6 py-5 text-left text-lg font-medium transition-colors",
                seleccionada
                  ? "border-clinical-blue-600 bg-clinical-blue-50 text-clinical-blue-700"
                  : "border-clinical-slate-200 bg-white text-clinical-slate-700 hover:border-clinical-slate-300"
              )}
            >
              {opcion.etiqueta}
            </button>
          );
        })}
      </div>
    </div>
  );
}
