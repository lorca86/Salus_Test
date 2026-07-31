import type {
  Assessment,
  NivelRiesgo,
  NormativeTable,
  Patient,
  Result,
  TestDefinition,
} from "@/lib/types";

/**
 * Motor de automatización y baremación.
 * 1) Calcula puntuaciones directas a partir de las respuestas crudas.
 * 2) Cruza dinámicamente con `normative_tables` (edad + sexo del paciente)
 *    para obtener percentiles / escalares.
 * 3) Determina el nivel de riesgo (semáforo) según reglas clínicas por test
 *    o, en su defecto, según el percentil obtenido.
 */

// --- 1. Puntuaciones directas -------------------------------------------------

export function calcularPuntuacionesDirectas(
  test: TestDefinition,
  respuestas: Record<string, number | string>
): Record<string, number> {
  switch (test.algoritmoCalculo) {
    case "suma_directa": {
      let total = 0;
      for (const pregunta of test.preguntas) {
        const valor = respuestas[pregunta.id];
        total += aValorNumerico(valor, pregunta.reverso, pregunta.opciones);
      }
      return { total };
    }

    case "suma_por_dominio": {
      const porDominio: Record<string, number> = {};
      for (const dominio of test.dominios ?? []) porDominio[dominio] = 0;
      for (const pregunta of test.preguntas) {
        const dominio = pregunta.dominio ?? "total";
        const valor = respuestas[pregunta.id];
        const puntos = aValorNumerico(valor, pregunta.reverso, pregunta.opciones);
        porDominio[dominio] = (porDominio[dominio] ?? 0) + puntos;
        // Ejes adicionales (p.ej. Perfil Sensorial-2: Cuadrante + Sección +
        // Factor escolar simultáneos): se acumulan aparte con clave "eje:valor"
        // sin interferir con el dominio principal de arriba.
        if (pregunta.ejesAdicionales) {
          for (const [eje, valorEje] of Object.entries(pregunta.ejesAdicionales)) {
            const clave = `${eje}:${valorEje}`;
            porDominio[clave] = (porDominio[clave] ?? 0) + puntos;
          }
        }
      }
      return porDominio;
    }

    case "conteo_categoria": {
      // Cuenta frecuencia de cada opción elegida (útil para tests de estilo/
      // preferencia como VARK, donde el resultado es una categoría dominante).
      const conteo: Record<string, number> = {};
      for (const pregunta of test.preguntas) {
        const valor = String(respuestas[pregunta.id] ?? "");
        if (!valor) continue;
        conteo[valor] = (conteo[valor] ?? 0) + 1;
      }
      return conteo;
    }

    case "personalizado":
    default:
      // Los tests con algoritmo propio (p.ej. ADOS-2) deben resolverse con
      // una función dedicada registrada en lib/scoring/custom/<codigo>.ts
      return { total: 0 };
  }
}

function aValorNumerico(
  valor: number | string | undefined,
  reverso: boolean | undefined,
  opciones: { valor: number | string }[]
): number {
  if (valor === undefined || valor === null || valor === "") return 0;
  const num = typeof valor === "number" ? valor : Number(valor);
  if (Number.isNaN(num)) return 0;
  if (!reverso) return num;
  const valores = opciones.map((o) => Number(o.valor)).filter((n) => !Number.isNaN(n));
  const max = Math.max(...valores);
  const min = Math.min(...valores);
  return max + min - num;
}

// --- 2. Cruce con baremos ------------------------------------------------------

export function buscarBaremo(
  tablas: NormativeTable[],
  testId: string,
  paciente: Pick<Patient, "edad" | "sexo">,
  dominio: string,
  puntuacionDirecta: number
): number | null {
  const tabla = tablas.find(
    (t) =>
      t.testId === testId &&
      paciente.edad >= t.edadMin &&
      paciente.edad <= t.edadMax &&
      (t.sexo === "ambos" || t.sexo === paciente.sexo) &&
      (t.dominio ?? "total") === dominio
  );
  if (!tabla) return null;
  const clave = String(Math.round(puntuacionDirecta));
  return tabla.tablaConversion[clave] ?? null;
}

export function calcularPercentiles(
  tablas: NormativeTable[],
  test: TestDefinition,
  paciente: Pick<Patient, "edad" | "sexo">,
  puntuacionesDirectas: Record<string, number>
): Record<string, number> {
  if (!test.requiereBaremo) return {};
  const percentiles: Record<string, number> = {};
  for (const [dominio, puntuacion] of Object.entries(puntuacionesDirectas)) {
    const percentil = buscarBaremo(tablas, test.id, paciente, dominio, puntuacion);
    if (percentil !== null) percentiles[dominio] = percentil;
  }
  return percentiles;
}

// --- 2b. Clasificación por bandas (Perfil Sensorial-2) -------------------------

interface BandaClasificacion {
  max: number;
  etiqueta: string;
}

function bandas5(a: number, b: number, c: number, d: number, e: number): BandaClasificacion[] {
  return [
    { max: a, etiqueta: "Mucho menos que los demás" },
    { max: b, etiqueta: "Menos que los demás" },
    { max: c, etiqueta: "Como los demás" },
    { max: d, etiqueta: "Más que los demás" },
    { max: e, etiqueta: "Mucho más que los demás" },
  ];
}

// Factor escolar 4 no tiene banda "Mucho menos que los demás" (el manual
// indica que no hay puntuaciones disponibles para esa categoría).
function bandas4(a: number, b: number, c: number, d: number): BandaClasificacion[] {
  return [
    { max: a, etiqueta: "Menos que los demás" },
    { max: b, etiqueta: "Como los demás" },
    { max: c, etiqueta: "Más que los demás" },
    { max: d, etiqueta: "Mucho más que los demás" },
  ];
}

// Puntos de corte oficiales del sistema de clasificación del Perfil
// Sensorial-2 (páginas de resumen del manual, Breve y Escolar).
const BANDAS_PERFIL_SENSORIAL: Record<string, Record<string, BandaClasificacion[]>> = {
  PS2_BREVE: {
    busqueda: bandas5(1, 6, 17, 22, 35),
    evitacion: bandas5(2, 8, 20, 26, 45),
    sensibilidad: bandas5(3, 9, 24, 31, 50),
    registro: bandas5(2, 5, 14, 18, 40),
    "seccion:sensorial": bandas5(5, 12, 27, 34, 70),
    "seccion:conductual": bandas5(7, 18, 43, 55, 100),
  },
  PS2_ESCOLAR: {
    busqueda: bandas5(2, 8, 21, 27, 40),
    evitacion: bandas5(0, 7, 24, 31, 60),
    sensibilidad: bandas5(5, 11, 24, 30, 55),
    registro: bandas5(0, 9, 27, 36, 65),
    "seccion:auditivo": bandas5(0, 5, 15, 19, 35),
    "seccion:visual": bandas5(1, 7, 18, 24, 35),
    "seccion:tactil": bandas5(1, 5, 16, 20, 40),
    "seccion:movimiento": bandas5(0, 6, 19, 25, 40),
    "seccion:conductual": bandas5(0, 7, 23, 30, 55),
    "factorEscolar:1": bandas5(1, 10, 27, 35, 65),
    "factorEscolar:2": bandas5(4, 11, 26, 33, 50),
    "factorEscolar:3": bandas5(2, 9, 24, 31, 60),
    "factorEscolar:4": bandas4(5, 18, 24, 45),
  },
};

export function calcularClasificaciones(
  test: TestDefinition,
  puntuacionesDirectas: Record<string, number>
): Record<string, string> {
  const tabla = BANDAS_PERFIL_SENSORIAL[test.codigo];
  if (!tabla) return {};
  const clasificaciones: Record<string, string> = {};
  for (const [dominio, puntuacion] of Object.entries(puntuacionesDirectas)) {
    const bandas = tabla[dominio];
    if (!bandas) continue;
    const encontrada = bandas.find((b) => puntuacion <= b.max);
    clasificaciones[dominio] = encontrada?.etiqueta ?? bandas[bandas.length - 1].etiqueta;
  }
  return clasificaciones;
}

// --- 3. Nivel de riesgo (semáforo) --------------------------------------------

// Puntos de corte clínicos conocidos para los autoinformes más comunes.
// Cualquier test no listado aquí cae al fallback por percentil.
const CORTES_CLINICOS: Record<string, { max: number; nivel: NivelRiesgo }[]> = {
  PHQ9: [
    { max: 4, nivel: "minimo" },
    { max: 9, nivel: "leve" },
    { max: 14, nivel: "moderado" },
    { max: 27, nivel: "severo" },
  ],
  GAD7: [
    { max: 4, nivel: "minimo" },
    { max: 9, nivel: "leve" },
    { max: 14, nivel: "moderado" },
    { max: 21, nivel: "severo" },
  ],
  BDI2: [
    { max: 13, nivel: "minimo" },
    { max: 19, nivel: "leve" },
    { max: 28, nivel: "moderado" },
    { max: 63, nivel: "severo" },
  ],
};

export function determinarNivelRiesgo(
  test: TestDefinition,
  puntuacionesDirectas: Record<string, number>,
  percentiles: Record<string, number>,
  clasificaciones?: Record<string, string>
): NivelRiesgo {
  const total = puntuacionesDirectas.total ?? Object.values(puntuacionesDirectas)[0] ?? 0;
  const cortes = CORTES_CLINICOS[test.codigo];
  if (cortes) {
    const encontrado = cortes.find((c) => total <= c.max);
    return encontrado?.nivel ?? "severo";
  }

  if (clasificaciones && Object.keys(clasificaciones).length > 0) {
    const etiquetas = Object.values(clasificaciones);
    if (etiquetas.some((e) => e.startsWith("Mucho"))) return "severo";
    if (etiquetas.some((e) => e === "Más que los demás" || e === "Menos que los demás")) return "moderado";
    return "minimo";
  }

  const percentilMax = Math.max(0, ...Object.values(percentiles));
  if (percentilMax === 0) return "minimo";
  if (percentilMax < 70) return "minimo";
  if (percentilMax < 85) return "leve";
  if (percentilMax < 95) return "moderado";
  return "severo";
}

// --- Orquestador ---------------------------------------------------------------

export function calcularResultado(
  assessment: Pick<Assessment, "id" | "testId" | "patientId" | "respuestas">,
  test: TestDefinition,
  paciente: Pick<Patient, "edad" | "sexo">,
  tablasBaremo: NormativeTable[]
): Omit<Result, "id"> {
  const puntuacionesDirectas = calcularPuntuacionesDirectas(test, assessment.respuestas);
  const percentiles = calcularPercentiles(tablasBaremo, test, paciente, puntuacionesDirectas);
  const clasificaciones = calcularClasificaciones(test, puntuacionesDirectas);
  const nivelRiesgo = determinarNivelRiesgo(test, puntuacionesDirectas, percentiles, clasificaciones);

  return {
    assessmentId: assessment.id,
    patientId: assessment.patientId,
    testId: test.id,
    puntuacionesDirectas,
    puntuacionesConvertidas: percentiles,
    percentiles,
    ...(Object.keys(clasificaciones).length > 0 ? { clasificaciones } : {}),
    nivelRiesgo,
    resumenTexto: generarResumenTexto(test, puntuacionesDirectas, nivelRiesgo),
    fechaCalculo: new Date().toISOString(),
  };
}

function generarResumenTexto(
  test: TestDefinition,
  puntuacionesDirectas: Record<string, number>,
  nivelRiesgo: NivelRiesgo
): string {
  const entradas = Object.entries(puntuacionesDirectas)
    .map(([dominio, puntuacion]) => `${dominio}: ${puntuacion}`)
    .join(", ");
  const nivelTexto: Record<NivelRiesgo, string> = {
    minimo: "mínimo",
    leve: "leve",
    moderado: "moderado",
    severo: "severo",
  };
  return `${test.nombre} — Puntuación(es): ${entradas}. Nivel de riesgo estimado: ${nivelTexto[nivelRiesgo]}.`;
}
