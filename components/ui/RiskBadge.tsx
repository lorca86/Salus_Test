import clsx from "clsx";
import type { NivelRiesgo } from "@/lib/types";

const ESTILOS: Record<NivelRiesgo, { bg: string; text: string; label: string }> = {
  minimo: { bg: "bg-green-100", text: "text-green-700", label: "Mínimo" },
  leve: { bg: "bg-lime-100", text: "text-lime-700", label: "Leve" },
  moderado: { bg: "bg-amber-100", text: "text-amber-700", label: "Moderado" },
  severo: { bg: "bg-red-100", text: "text-red-700", label: "Severo" },
  pendiente: { bg: "bg-clinical-slate-100", text: "text-clinical-slate-500", label: "Clasificación pendiente" },
};

export function RiskBadge({ nivel }: { nivel: NivelRiesgo }) {
  const estilo = ESTILOS[nivel];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold",
        estilo.bg,
        estilo.text
      )}
    >
      <span className={clsx("h-2 w-2 rounded-full", estilo.text.replace("text-", "bg-"))} />
      {estilo.label}
    </span>
  );
}
