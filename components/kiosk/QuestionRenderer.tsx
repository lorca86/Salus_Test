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
      <p className="mb-6 text-center text-lg font-medium leading-relaxed text-clinical-slate-800 sm:mb-10 sm:text-2xl">
        {pregunta.texto}
      </p>
      <div className={clsx("grid gap-2 sm:gap-3", disposicion)}>
        {pregunta.opciones.map((opcion) => {
          const seleccionada = valorSeleccionado === opcion.valor;
          return (
            <button
              key={String(opcion.valor)}
              type="button"
              onClick={() => onResponder(opcion.valor)}
              className={clsx(
                "rounded-2xl border-2 px-4 py-3 text-left text-base font-medium transition-colors sm:px-6 sm:py-5 sm:text-lg",
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
