// Algoritmos personalizados de ADOS-2 (Autism Diagnostic Observation
// Schedule, 2ª ed.; Lord et al. © Western Psychological Services /
// adaptación española © TEA Ediciones). Cargado con contenido y algoritmo
// oficiales proporcionados por el usuario, quien confirmó contar con la
// certificación clínica y licencia requeridas para su uso.
//
// A diferencia de los cuestionarios de autoinforme, ADOS-2 no es una suma
// simple: cada módulo (T, 1, 2, 3, 4) tiene su propio subconjunto de ítems
// de algoritmo, reglas de conversión de código y tablas de corte — algunas
// dependientes de la edad cronológica y/o el nivel de lenguaje del sujeto.
// Por eso se registra aquí como algoritmoCalculo: "personalizado" en vez de
// usar el motor genérico de lib/scoring/engine.ts.

export interface ResultadoADOS2 {
  puntuacionesDirectas: Record<string, number>;
  clasificaciones: Record<string, string>;
  nivelRiesgo: "minimo" | "leve" | "moderado" | "severo" | "pendiente";
}

function valorItem(respuestas: Record<string, number | string>, id: string): number {
  const valor = respuestas[id];
  const num = typeof valor === "number" ? valor : Number(valor);
  return Number.isNaN(num) ? 0 : num;
}

// --- Módulo T (Preverbal/Palabras sueltas, 12-30 meses) ------------------------

const AS_ITEMS_T = [
  "ados2t_a2", "ados2t_a7", "ados2t_a8",
  "ados2t_b1", "ados2t_b4", "ados2t_b5", "ados2t_b6", "ados2t_b7", "ados2t_b8",
  "ados2t_b9", "ados2t_b12", "ados2t_b13", "ados2t_b14", "ados2t_b15", "ados2t_b16b", "ados2t_b18",
];
const CRR_ITEMS_T = ["ados2t_a3", "ados2t_d1", "ados2t_d2", "ados2t_d5"];

// Conversión de código de ítem a puntuación de algoritmo: 0->0,1->1,2->2,
// 3->3,7->0,8->0,9->0. Excepción ítem B1 ("Contacto visual inusual"):
// 0->0,1->2,2->2,3->2,7->0,8->0,9->0.
function convertirCodigoT(itemId: string, codigo: number): number {
  if (itemId === "ados2t_b1") {
    if (codigo === 0) return 0;
    if (codigo >= 1 && codigo <= 3) return 2;
    return 0;
  }
  if (codigo >= 0 && codigo <= 3) return codigo;
  return 0;
}

export function calcularADOS2ModuloT(
  respuestas: Record<string, number | string>,
  edadMesesCronologica: number
): ResultadoADOS2 {
  const codigoA1 = valorItem(respuestas, "ados2t_a1");
  // Columna "niños mayores con algunas palabras": edad 21-30 meses Y código
  // 0, 1 o 2 en A1. En cualquier otro caso (incluida edad 12-20 meses, o
  // 21-30 meses con código 3 o 4 en A1) se usa la columna "todos los niños
  // pequeños / niños mayores con pocas palabras o ninguna".
  const columnaConPalabras =
    edadMesesCronologica >= 21 && edadMesesCronologica <= 30 && codigoA1 <= 2;

  let totalAS = 0;
  for (const id of AS_ITEMS_T) totalAS += convertirCodigoT(id, valorItem(respuestas, id));
  let totalCRR = 0;
  for (const id of CRR_ITEMS_T) totalCRR += convertirCodigoT(id, valorItem(respuestas, id));
  const totalGlobal = totalAS + totalCRR;

  const cortes = columnaConPalabras
    ? { moderadaSevera: 12, leveModerada: 8 }
    : { moderadaSevera: 14, leveModerada: 10 };

  let rango: string;
  let nivelRiesgo: ResultadoADOS2["nivelRiesgo"];
  if (totalGlobal >= cortes.moderadaSevera) {
    rango = "Preocupación moderada-severa";
    nivelRiesgo = "severo";
  } else if (totalGlobal >= cortes.leveModerada) {
    rango = "Preocupación leve-moderada";
    nivelRiesgo = "moderado";
  } else {
    rango = "Poca o ninguna preocupación";
    nivelRiesgo = "minimo";
  }

  return {
    puntuacionesDirectas: { total_AS: totalAS, total_CRR: totalCRR, total_global: totalGlobal },
    clasificaciones: {
      algoritmo: columnaConPalabras
        ? "Niños mayores con algunas palabras"
        : "Todos los niños pequeños / niños mayores con pocas palabras o ninguna",
      rango_preocupacion: rango,
    },
    nivelRiesgo,
  };
}

// --- Módulo 2 (Habla con frases) ------------------------------------------
//
// A diferencia del Módulo T, la conversión de código a puntuación de
// algoritmo es la misma para todos los ítems (no hay excepción tipo B1). La
// clasificación depende de dos columnas por edad cronológica (según la hoja
// oficial de algoritmo y su tabla de corte):
//   Menores de 5 años: Autismo >= 10; Espectro autista 7-9; No TEA <= 6.
//   5 años o más:      Autismo >= 9;  Espectro autista == 8; No TEA <= 7.

const AS_ITEMS_2 = [
  "ados22_a6", "ados22_a7",
  "ados22_b1", "ados22_b2", "ados22_b3", "ados22_b5", "ados22_b6",
  "ados22_b8", "ados22_b11", "ados22_b12",
];
const CRR_ITEMS_2 = ["ados22_a4", "ados22_d1", "ados22_d2", "ados22_d4"];

// Conversión de código de ítem a puntuación de algoritmo: 0->0,1->1,2->2,
// 3->2,7->0,8->0,9->0 (igual para todos los ítems de este módulo y el 3).
function convertirCodigo2(codigo: number): number {
  if (codigo === 0 || codigo === 1 || codigo === 2) return codigo;
  if (codigo === 3) return 2;
  return 0;
}

export function calcularADOS2Modulo2(
  respuestas: Record<string, number | string>,
  edadMesesCronologica: number
): ResultadoADOS2 {
  let totalAS = 0;
  for (const id of AS_ITEMS_2) totalAS += convertirCodigo2(valorItem(respuestas, id));
  let totalCRR = 0;
  for (const id of CRR_ITEMS_2) totalCRR += convertirCodigo2(valorItem(respuestas, id));
  const totalGlobal = totalAS + totalCRR;

  const menorDe5 = edadMesesCronologica < 60;
  const cortes = menorDe5
    ? { autismo: 10, espectro: 7 }
    : { autismo: 9, espectro: 8 };

  let clasificacion: string;
  let nivelRiesgo: ResultadoADOS2["nivelRiesgo"];
  if (totalGlobal >= cortes.autismo) {
    clasificacion = "Autismo";
    nivelRiesgo = "severo";
  } else if (totalGlobal >= cortes.espectro) {
    clasificacion = "Espectro autista";
    nivelRiesgo = "moderado";
  } else {
    clasificacion = "No TEA";
    nivelRiesgo = "minimo";
  }

  return {
    puntuacionesDirectas: { total_AS: totalAS, total_CRR: totalCRR, total_global: totalGlobal },
    clasificaciones: {
      columna_edad: menorDe5 ? "Menores de 5 años" : "5 años o más",
      clasificacion_ados2: clasificacion,
    },
    nivelRiesgo,
  };
}

// --- Módulo 3 (Fluidez verbal — niños y adolescentes) ---------------------
//
// Misma conversión genérica de código que el Módulo 2 (0/1/2 directo, 3->2,
// 7/8/9->0), pero este cuadernillo sí incluye la tabla oficial de
// clasificación por puntos de corte (una sola columna, sin distinción por
// edad): Autismo si Total global >= 9; Espectro autista si 7-8; No TEA si
// <= 6.

const AS_ITEMS_3 = [
  "ados23_a7", "ados23_a8", "ados23_a9",
  "ados23_b1", "ados23_b2", "ados23_b4", "ados23_b7", "ados23_b9", "ados23_b10", "ados23_b11",
];
const CRR_ITEMS_3 = ["ados23_a4", "ados23_d1", "ados23_d2", "ados23_d4"];

export function calcularADOS2Modulo3(
  respuestas: Record<string, number | string>
): ResultadoADOS2 {
  let totalAS = 0;
  for (const id of AS_ITEMS_3) totalAS += convertirCodigo2(valorItem(respuestas, id));
  let totalCRR = 0;
  for (const id of CRR_ITEMS_3) totalCRR += convertirCodigo2(valorItem(respuestas, id));
  const totalGlobal = totalAS + totalCRR;

  let clasificacion: string;
  let nivelRiesgo: ResultadoADOS2["nivelRiesgo"];
  if (totalGlobal >= 9) {
    clasificacion = "Autismo";
    nivelRiesgo = "severo";
  } else if (totalGlobal >= 7) {
    clasificacion = "Espectro autista";
    nivelRiesgo = "moderado";
  } else {
    clasificacion = "No TEA";
    nivelRiesgo = "minimo";
  }

  return {
    puntuacionesDirectas: { total_AS: totalAS, total_CRR: totalCRR, total_global: totalGlobal },
    clasificaciones: { clasificacion_ados2: clasificacion },
    nivelRiesgo,
  };
}

// Registro de algoritmos por código de test. Se amplía a medida que se
// agregan más módulos (1, 4).
export function calcularADOS2(
  codigoTest: string,
  respuestas: Record<string, number | string>,
  edadMesesCronologica: number
): ResultadoADOS2 {
  switch (codigoTest) {
    case "ADOS2_T":
      return calcularADOS2ModuloT(respuestas, edadMesesCronologica);
    case "ADOS2_2":
      return calcularADOS2Modulo2(respuestas, edadMesesCronologica);
    case "ADOS2_3":
      return calcularADOS2Modulo3(respuestas);
    default:
      throw new Error(`No hay algoritmo ADOS-2 registrado para "${codigoTest}"`);
  }
}
