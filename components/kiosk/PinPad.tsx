"use client";

import { Delete } from "lucide-react";
import clsx from "clsx";

interface PinPadProps {
  valor: string;
  onCambio: (valor: string) => void;
  deshabilitado?: boolean;
}

const TECLAS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "borrar"];

export function PinPad({ valor, onCambio, deshabilitado }: PinPadProps) {
  function presionar(tecla: string) {
    if (deshabilitado) return;
    if (tecla === "borrar") {
      onCambio(valor.slice(0, -1));
      return;
    }
    if (valor.length >= 4) return;
    onCambio(valor + tecla);
  }

  return (
    <div className="w-full max-w-xs">
      <div className="mb-8 flex justify-center gap-4">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={clsx(
              "h-4 w-4 rounded-full border-2 border-clinical-slate-300 transition-colors",
              i < valor.length && "border-clinical-blue-600 bg-clinical-blue-600"
            )}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {TECLAS.map((tecla, i) =>
          tecla === "" ? (
            <div key={i} />
          ) : (
            <button
              key={i}
              type="button"
              disabled={deshabilitado}
              onClick={() => presionar(tecla)}
              className="flex h-16 items-center justify-center rounded-2xl bg-clinical-slate-100 text-2xl font-semibold text-clinical-slate-800 active:bg-clinical-slate-200 disabled:opacity-40"
            >
              {tecla === "borrar" ? <Delete className="h-6 w-6" /> : tecla}
            </button>
          )
        )}
      </div>
    </div>
  );
}
