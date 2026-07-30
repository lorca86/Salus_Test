import type { CategoriaTest } from "@/lib/types";

interface CategoriaInfo {
  valor: CategoriaTest;
  etiqueta: string;
  badge: string; // fondo + texto para el chip de la tarjeta
  dot: string; // color sólido para el punto/indicador
  pill: string; // estilo del botón de filtro cuando está activo
}

export const CATEGORIAS: CategoriaInfo[] = [
  {
    valor: "psicologia",
    etiqueta: "Psicología",
    badge: "bg-clinical-blue-50 text-clinical-blue-700",
    dot: "bg-clinical-blue-600",
    pill: "bg-clinical-blue-600 text-white",
  },
  {
    valor: "autismo",
    etiqueta: "Autismo",
    badge: "bg-violet-50 text-violet-700",
    dot: "bg-violet-600",
    pill: "bg-violet-600 text-white",
  },
  {
    valor: "laboral",
    etiqueta: "Laboral",
    badge: "bg-amber-50 text-amber-700",
    dot: "bg-amber-600",
    pill: "bg-amber-600 text-white",
  },
  {
    valor: "pedagogia",
    etiqueta: "Pedagogía",
    badge: "bg-teal-50 text-teal-700",
    dot: "bg-teal-600",
    pill: "bg-teal-600 text-white",
  },
];

export function infoCategoria(categoria: CategoriaTest): CategoriaInfo {
  return CATEGORIAS.find((c) => c.valor === categoria) ?? CATEGORIAS[0];
}
