/**
 * Seed del catálogo de pruebas (`tests`) y baremos de ejemplo
 * (`normative_tables`) en Firestore.
 *
 * PHQ-9 y GAD-7 se cargan completos (son instrumentos de dominio público,
 * de uso clínico y educativo libre). El resto del catálogo (VARK, ZAVIC,
 * Cleaver, Proceso Pensante, Valores Personales, BDI-II, M-CHAT-R, 16PF,
 * ABC y ADOS-2) se crea con su ESTRUCTURA completa (tipo, algoritmo,
 * dominios, si requiere baremo, si es de observación) pero con un set de
 * preguntas de ejemplo/placeholder: son instrumentos con derechos de autor
 * o que requieren capacitación clínica para su reactivo oficial, así que
 * el equipo debe cargar el ítem oficial licenciado antes de usarlos en
 * producción.
 *
 * Uso:
 *   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json npm run seed
 */

import { initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { TestDefinition, NormativeTable } from "../lib/types";

const app = initializeApp({
  credential: process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? applicationDefault()
    : cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON ?? "{}")),
});
const db = getFirestore(app);

const likert4 = [
  { valor: 0, etiqueta: "Nunca" },
  { valor: 1, etiqueta: "Varios días" },
  { valor: 2, etiqueta: "Más de la mitad de los días" },
  { valor: 3, etiqueta: "Casi todos los días" },
];

const PHQ9: TestDefinition = {
  id: "phq9",
  codigo: "PHQ9",
  nombre: "PHQ-9 (Patient Health Questionnaire)",
  tipo: "autoinforme",
  categoria: "psicologia",
  descripcion: "Cuestionario de tamizaje de depresión.",
  instrucciones:
    "Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado los siguientes problemas?",
  tiempoLimiteMin: 10,
  algoritmoCalculo: "suma_directa",
  requiereBaremo: false,
  activo: true,
  preguntas: [
    "Poco interés o placer en hacer las cosas",
    "Se ha sentido decaído(a), deprimido(a) o sin esperanzas",
    "Dificultad para quedarse o permanecer dormido(a), o ha dormido demasiado",
    "Se ha sentido cansado(a) o con poca energía",
    "Falta de apetito o ha comido en exceso",
    "Se ha sentido mal consigo mismo(a), o que es un fracaso o que ha quedado mal con usted o su familia",
    "Dificultad para concentrarse en actividades como leer el periódico o ver televisión",
    "Se ha movido o hablado tan lento que otras personas lo pudieron notar, o lo contrario: muy inquieto(a)",
    "Pensamientos de que estaría mejor muerto(a) o de lastimarse de alguna manera",
  ].map((texto, i) => ({
    id: `phq9_${i + 1}`,
    texto,
    tipo: "likert" as const,
    opciones: likert4,
  })),
};

const GAD7: TestDefinition = {
  id: "gad7",
  codigo: "GAD7",
  nombre: "GAD-7 (Generalized Anxiety Disorder)",
  tipo: "autoinforme",
  categoria: "psicologia",
  descripcion: "Cuestionario de tamizaje de ansiedad generalizada.",
  instrucciones:
    "Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado los siguientes problemas?",
  tiempoLimiteMin: 8,
  algoritmoCalculo: "suma_directa",
  requiereBaremo: false,
  activo: true,
  preguntas: [
    "Sentirse nervioso(a), ansioso(a) o con los nervios de punta",
    "No poder dejar de preocuparse o controlar la preocupación",
    "Preocuparse demasiado por diferentes cosas",
    "Dificultad para relajarse",
    "Estar tan inquieto(a) que es difícil quedarse quieto(a)",
    "Molestarse o irritarse fácilmente",
    "Sentir miedo como si algo terrible pudiera pasar",
  ].map((texto, i) => ({
    id: `gad7_${i + 1}`,
    texto,
    tipo: "likert" as const,
    opciones: likert4,
  })),
};

const VARK: TestDefinition = {
  id: "vark",
  codigo: "VARK",
  nombre: "VARK (Estilos de Aprendizaje)",
  tipo: "autoinforme",
  categoria: "pedagogia",
  descripcion: "Identifica preferencia de estilo de aprendizaje: Visual, Auditivo, Lectura/Escritura, Kinestésico.",
  instrucciones: "Elija la opción que mejor describa su preferencia en cada situación.",
  algoritmoCalculo: "conteo_categoria",
  requiereBaremo: false,
  activo: true,
  preguntas: [
    {
      id: "vark_1",
      texto: "Para aprender algo nuevo, prefiero:",
      tipo: "opcion_multiple",
      opciones: [
        { valor: "V", etiqueta: "Ver diagramas, gráficos o videos" },
        { valor: "A", etiqueta: "Escuchar una explicación" },
        { valor: "L", etiqueta: "Leer instrucciones escritas" },
        { valor: "K", etiqueta: "Practicarlo yo mismo(a)" },
      ],
    },
  ],
};

const ZAVIC: TestDefinition = {
  id: "zavic",
  codigo: "ZAVIC",
  nombre: "ZAVIC (Valores Interpersonales)",
  tipo: "autoinforme",
  categoria: "laboral",
  descripcion: "Test de elección forzada / pareada de valores.",
  instrucciones: "En cada par, elija la afirmación con la que más se identifique.",
  algoritmoCalculo: "conteo_categoria",
  requiereBaremo: false,
  activo: true,
  preguntas: [
    {
      id: "zavic_1",
      texto: "¿Cuál de estas dos afirmaciones lo representa mejor?",
      tipo: "eleccion_forzada",
      opciones: [
        { valor: "A", etiqueta: "Prefiero seguir reglas claras" },
        { valor: "B", etiqueta: "Prefiero tener libertad para decidir" },
      ],
    },
  ],
};

const CLEAVER: TestDefinition = {
  id: "cleaver",
  codigo: "CLEAVER",
  nombre: "Cleaver (Perfil DISC)",
  tipo: "autoinforme",
  categoria: "laboral",
  descripcion: "Perfil conductual DISC (Dominancia, Influencia, Estabilidad, Cumplimiento).",
  instrucciones: "En cada grupo, seleccione la palabra que MÁS y la que MENOS lo describe.",
  algoritmoCalculo: "conteo_categoria",
  requiereBaremo: false,
  activo: true,
  preguntas: [
    {
      id: "cleaver_1",
      texto: "De este grupo de palabras, ¿cuál lo describe más?",
      tipo: "eleccion_forzada",
      opciones: [
        { valor: "D", etiqueta: "Decidido" },
        { valor: "I", etiqueta: "Entusiasta" },
        { valor: "S", etiqueta: "Paciente" },
        { valor: "C", etiqueta: "Meticuloso" },
      ],
    },
  ],
};

const PROCESO_PENSANTE: TestDefinition = {
  id: "proceso_pensante",
  codigo: "PROC_PENSANTE",
  nombre: "Proceso Pensante",
  tipo: "autoinforme",
  categoria: "pedagogia",
  descripcion: "Evalúa estilo predominante de razonamiento y toma de decisiones.",
  instrucciones: "Seleccione la opción que mejor represente su forma habitual de pensar.",
  algoritmoCalculo: "conteo_categoria",
  requiereBaremo: false,
  activo: true,
  preguntas: [
    {
      id: "pp_1",
      texto: "Frente a un problema nuevo, usted normalmente:",
      tipo: "opcion_multiple",
      opciones: [
        { valor: "analitico", etiqueta: "Analiza datos paso a paso" },
        { valor: "intuitivo", etiqueta: "Confía en su intuición" },
        { valor: "practico", etiqueta: "Busca una solución práctica inmediata" },
      ],
    },
  ],
};

const VALORES_PERSONALES: TestDefinition = {
  id: "valores_personales",
  codigo: "VALORES_PERS",
  nombre: "Valores Personales",
  tipo: "autoinforme",
  categoria: "laboral",
  descripcion: "Identifica jerarquía de valores personales dominantes.",
  instrucciones: "Ordene o seleccione según la importancia que le da a cada valor.",
  algoritmoCalculo: "conteo_categoria",
  requiereBaremo: false,
  activo: true,
  preguntas: [
    {
      id: "vp_1",
      texto: "¿Cuál de estos valores es más importante para usted?",
      tipo: "opcion_multiple",
      opciones: [
        { valor: "familia", etiqueta: "Familia" },
        { valor: "logro", etiqueta: "Logro personal" },
        { valor: "seguridad", etiqueta: "Seguridad" },
        { valor: "servicio", etiqueta: "Servicio a los demás" },
      ],
    },
  ],
};

const BDI2: TestDefinition = {
  id: "bdi2",
  codigo: "BDI2",
  nombre: "BDI-II (Beck Depression Inventory)",
  tipo: "autoinforme",
  categoria: "psicologia",
  descripcion:
    "Inventario de depresión de Beck. Instrumento con derechos reservados: cargar el reactivo oficial licenciado antes de uso clínico real.",
  instrucciones: "Seleccione la afirmación que mejor describa cómo se ha sentido las últimas 2 semanas.",
  algoritmoCalculo: "suma_directa",
  requiereBaremo: true,
  activo: true,
  preguntas: Array.from({ length: 21 }, (_, i) => ({
    id: `bdi2_${i + 1}`,
    texto: `[Reactivo oficial BDI-II #${i + 1} — cargar texto licenciado]`,
    tipo: "likert" as const,
    opciones: [
      { valor: 0, etiqueta: "No aplica / ausente" },
      { valor: 1, etiqueta: "Leve" },
      { valor: 2, etiqueta: "Moderado" },
      { valor: 3, etiqueta: "Severo" },
    ],
  })),
};

const MCHAT: TestDefinition = {
  id: "mchat",
  codigo: "MCHAT",
  nombre: "M-CHAT-R (Tamizaje de Autismo)",
  tipo: "autoinforme",
  categoria: "autismo",
  descripcion:
    "Cuestionario de tamizaje de autismo respondido por el cuidador/tutor. Cargar reactivo oficial antes de uso clínico.",
  instrucciones: "Responda pensando en el comportamiento habitual del niño/a.",
  algoritmoCalculo: "suma_directa",
  requiereBaremo: false,
  activo: true,
  preguntas: Array.from({ length: 20 }, (_, i) => ({
    id: `mchat_${i + 1}`,
    texto: `[Reactivo oficial M-CHAT-R #${i + 1} — cargar texto licenciado]`,
    tipo: "si_no" as const,
    opciones: [
      { valor: 1, etiqueta: "Sí" },
      { valor: 0, etiqueta: "No" },
    ],
  })),
};

const PF16: TestDefinition = {
  id: "16pf",
  codigo: "16PF",
  nombre: "16PF (Cuestionario de Personalidad)",
  tipo: "autoinforme",
  categoria: "laboral",
  descripcion:
    "Cuestionario de 16 factores de personalidad. Instrumento con derechos reservados: cargar reactivo oficial licenciado.",
  instrucciones: "Seleccione la opción que mejor lo represente en cada situación.",
  algoritmoCalculo: "suma_por_dominio",
  requiereBaremo: true,
  dominios: ["A", "B", "C", "E", "F", "G", "H", "I", "L", "M", "N", "O", "Q1", "Q2", "Q3", "Q4"],
  activo: true,
  preguntas: [
    {
      id: "pf16_a_1",
      texto: "[Reactivo oficial 16PF factor A #1 — cargar texto licenciado]",
      tipo: "likert",
      dominio: "A",
      opciones: [
        { valor: 0, etiqueta: "En desacuerdo" },
        { valor: 1, etiqueta: "Neutral" },
        { valor: 2, etiqueta: "De acuerdo" },
      ],
    },
  ],
};

// Asignación oficial de ítems a subescalas (hoja de corrección ABC-ECA,
// Aman, Singh, Stewart y Field, 1995). Puntuación máxima por subescala:
// Agitación 45 (15 ítems), Letargia 48 (16), Estereotipias 21 (7),
// Hiperactividad 48 (16), Locuacidad 12 (4).
const ABC_DOMINIO_POR_ITEM: Record<number, string> = {
  2: "agitacion", 4: "agitacion", 8: "agitacion", 10: "agitacion", 14: "agitacion",
  19: "agitacion", 25: "agitacion", 29: "agitacion", 34: "agitacion", 36: "agitacion",
  41: "agitacion", 47: "agitacion", 50: "agitacion", 52: "agitacion", 57: "agitacion",
  3: "letargia", 5: "letargia", 12: "letargia", 16: "letargia", 20: "letargia",
  23: "letargia", 26: "letargia", 30: "letargia", 32: "letargia", 37: "letargia",
  40: "letargia", 42: "letargia", 43: "letargia", 53: "letargia", 55: "letargia", 58: "letargia",
  6: "estereotipias", 11: "estereotipias", 17: "estereotipias", 27: "estereotipias",
  35: "estereotipias", 45: "estereotipias", 49: "estereotipias",
  1: "hiperactividad", 7: "hiperactividad", 13: "hiperactividad", 15: "hiperactividad",
  18: "hiperactividad", 21: "hiperactividad", 24: "hiperactividad", 28: "hiperactividad",
  31: "hiperactividad", 38: "hiperactividad", 39: "hiperactividad", 44: "hiperactividad",
  48: "hiperactividad", 51: "hiperactividad", 54: "hiperactividad", 56: "hiperactividad",
  9: "locuacidad", 22: "locuacidad", 33: "locuacidad", 46: "locuacidad",
};

const ABC_ITEMS = [
  "Excesiva actividad en el Centro",
  "Autoagresividad",
  "Apatía, pereza, inactividad",
  "Agresividad hacia otros pacientes o el personal",
  "Búsqueda de aislamiento del resto de sujetos",
  "Movimientos recurrentes sin sentido",
  'Ser demasiado "escandaloso" o "ruidoso"',
  'Gritar "sin venir a cuento"',
  "Hablar excesivamente",
  "Rabietas",
  "Movimientos estereotipados o repetidos",
  "Ensimismamiento, mirada perdida",
  "Impulsividad (realiza actos sin pensar)",
  "Irritabilidad",
  "Inquietud, incapacidad de estar quieto",
  "Inhibición; prefiere actividades solitarias",
  "Conductas extrañas o estrambóticas",
  "Desobediencia; dificultad para controlarlo",
  "Gritos inoportunos",
  "Expresión facial rígida; falta de reactividad emocional",
  "Molesta a los otros",
  "Lenguaje repetitivo",
  "No hace nada; se sienta y mira a otros",
  "No coopera con los demás",
  "Humor deprimido",
  "Se resiste a cualquier forma de contacto físico",
  "Vuelve la cabeza hacia atrás continuamente",
  "No presta atención a las instrucciones",
  "Sus demandas deben ser satisfechas inmediatamente",
  "Se aísla de sí mismo/a del resto",
  "Desbarata las actividades de grupo",
  "Se sienta o permanece en una misma posición mucho tiempo",
  "Habla consigo mismo en voz alta",
  "Llora ante mínimos disgustos o pequeños golpes",
  "Realiza movimientos repetitivos de manos, cuerpo o cabeza",
  "Cambia de humor repentinamente",
  "No responde a las actividades del Centro",
  "No se queda quieto en su sitio durante las clases",
  "Procura no quedarse solo, aún por pequeños espacios de tiempo",
  "Es difícil acercarse o establecer relación con él",
  "Llora y chilla de manera inapropiada",
  "Prefiere estar solo",
  "No intenta comunicarse mediante palabra ni gestos",
  "Se distrae fácilmente",
  "Mueve o agita las extremidades repetidamente",
  "Repite una palabra o una frase una y otra vez",
  "Da patadas mientras tira objetos o da portazos",
  "Corre o salta constantemente por la habitación",
  "Mueve el cuerpo hacia delante y hacia atrás una y otra vez",
  "Se hace heridas a sí mismo/a de forma deliberada",
  "No presta atención cuando le hablan",
  "Es violento consigo mismo/a",
  "Es inactivo, nunca se mueve de forma espontánea",
  "Tiende a ser excesivamente activo",
  "Responde de forma negativa a las muestras de cariño",
  "Ignora las órdenes de forma deliberada",
  "Coge rabietas cuando no consigue lo que quiere",
  "Presenta poca interacción con los otros",
];

const abcOpciones = [
  { valor: 0, etiqueta: "No presenta este problema en absoluto" },
  { valor: 1, etiqueta: "Problema leve" },
  { valor: 2, etiqueta: "Problema de gravedad moderada" },
  { valor: 3, etiqueta: "Problema importante" },
];

const ABC: TestDefinition = {
  id: "abc",
  codigo: "ABC",
  nombre: "ABC-ECA (Escala de Conductas Anómalas)",
  tipo: "autoinforme",
  categoria: "autismo",
  descripcion:
    "Escala de Conductas Anómalas (Aman, Singh, Stewart y Field, 1995), respondida por el " +
    "cuidador/evaluador según la observación del comportamiento del paciente.",
  instrucciones:
    "Evalúe la conducta del sujeto durante las últimas semanas. Para cada ítem decida el grado del " +
    "problema: 0 = No presenta este problema en absoluto, 1 = Problema leve, 2 = Problema de gravedad " +
    "moderada, 3 = Problema importante.",
  algoritmoCalculo: "suma_por_dominio",
  requiereBaremo: true,
  dominios: ["agitacion", "letargia", "estereotipias", "hiperactividad", "locuacidad"],
  activo: true,
  preguntas: ABC_ITEMS.map((texto, i) => ({
    id: `abc_${i + 1}`,
    texto,
    tipo: "likert" as const,
    dominio: ABC_DOMINIO_POR_ITEM[i + 1],
    opciones: abcOpciones,
  })),
};

const ADOS2: TestDefinition = {
  id: "ados2",
  codigo: "ADOS2",
  nombre: "ADOS-2 (Observación Diagnóstica)",
  tipo: "observacion",
  categoria: "autismo",
  descripcion:
    "Escala de observación clínica de autismo. Aplicación EXCLUSIVA del evaluador durante la sesión; nunca visible en modo paciente/tablet.",
  instrucciones: "Registre la calificación de cada ítem mientras observa la sesión con el paciente.",
  algoritmoCalculo: "suma_por_dominio",
  requiereBaremo: true,
  dominios: ["comunicacion", "interaccion_social", "juego", "conductas_restringidas"],
  activo: true,
  preguntas: Array.from({ length: 8 }, (_, i) => ({
    id: `ados2_${i + 1}`,
    texto: `[Ítem de observación ADOS-2 #${i + 1} — requiere capacitación clínica oficial]`,
    tipo: "likert" as const,
    dominio: ["comunicacion", "interaccion_social", "juego", "conductas_restringidas"][i % 4],
    opciones: [
      { valor: 0, etiqueta: "Sin anormalidad" },
      { valor: 1, etiqueta: "Anormalidad leve" },
      { valor: 2, etiqueta: "Anormalidad marcada" },
    ],
  })),
};

// ---------------------------------------------------------------------------
// Perfil Sensorial-2 (Winnie Dunn; adaptación española © 2016 NCS Pearson /
// PsychCorp). Instrumento con derechos reservados: cargado con contenido y
// clave de calificación oficiales proporcionados por el usuario, quien
// confirmó contar con la licencia correspondiente para su uso.
//
// Cada ítem se clasifica en un Cuadrante (Búsqueda/Evitación/Sensibilidad/
// Registro, el eje principal -> `dominio`) y, según la versión, también en
// una Sección sensorial y/o un Factor escolar (ejes adicionales). El motor
// de cálculo (lib/scoring/engine.ts) suma cada ítem en todos sus ejes a la
// vez mediante `ejesAdicionales`.
//
// Las bandas de clasificación oficiales (Mucho menos / Menos / Como los
// demás / Más / Mucho más que los demás) están implementadas en
// lib/scoring/engine.ts (BANDAS_PERFIL_SENSORIAL / calcularClasificaciones)
// y se calculan automáticamente para cada cuadrante/sección/factor.
const psOpciones = [
  { valor: 5, etiqueta: "Casi siempre o siempre (90% o más)" },
  { valor: 4, etiqueta: "Frecuentemente (75%)" },
  { valor: 3, etiqueta: "La mitad de las veces (50%)" },
  { valor: 2, etiqueta: "Ocasionalmente (25%)" },
  { valor: 1, etiqueta: "Casi nunca o nunca (10% o menos)" },
  { valor: 0, etiqueta: "No aplicable" },
];

const PS_BREVE_ITEMS: { texto: string; cuadrante: string; seccion: string }[] = [
  { texto: "Le cuesta terminar las tareas cuando está puesta la música o la televisión.", cuadrante: "sensibilidad", seccion: "sensorial" },
  { texto: "Se distrae cuando hay mucho ruido a su alrededor.", cuadrante: "sensibilidad", seccion: "sensorial" },
  { texto: "No me hace caso o parece ignorarme.", cuadrante: "sensibilidad", seccion: "sensorial" },
  { texto: "Se muestra angustiado cuando lo arreglan (p. ej., pelea o llora cuando le cortan el pelo, le lavan la cara, le cortan las uñas).", cuadrante: "sensibilidad", seccion: "sensorial" },
  { texto: "Se pone nervioso cuando está de pie cerca de otras personas (p. ej., hacer cola).", cuadrante: "sensibilidad", seccion: "sensorial" },
  { texto: "Toca tanto a las personas o las cosas que llega a molestar a los demás.", cuadrante: "busqueda", seccion: "sensorial" },
  { texto: "Se mueve tanto que afecta a sus actividades diarias (p. ej., no puede estar sentado sin moverse, quedarse quieto).", cuadrante: "busqueda", seccion: "sensorial" },
  { texto: "Se balancea mientras está sentado en la silla, en el suelo o de pie.", cuadrante: "busqueda", seccion: "sensorial" },
  { texto: "Pierde el equilibrio inesperadamente cuando camina por una superficie irregular.", cuadrante: "registro", seccion: "sensorial" },
  { texto: "Choca con las cosas, sin darse cuenta de los objetos o personas que hay en su camino.", cuadrante: "registro", seccion: "sensorial" },
  { texto: "Muestra una clara preferencia por ciertos sabores.", cuadrante: "busqueda", seccion: "sensorial" },
  { texto: "Se mueve con rigidez.", cuadrante: "registro", seccion: "sensorial" },
  { texto: "Se cansa fácilmente, en especial cuando está de pie o mantiene el cuerpo en una misma posición.", cuadrante: "registro", seccion: "sensorial" },
  { texto: "Se estira echándose sobre los muebles o las personas.", cuadrante: "busqueda", seccion: "sensorial" },
  { texto: "Parece propenso a tener accidentes.", cuadrante: "registro", seccion: "conductual" },
  { texto: "Puede ser terco y poco dispuesto a colaborar.", cuadrante: "evitacion", seccion: "conductual" },
  { texto: "Coge berrinches.", cuadrante: "evitacion", seccion: "conductual" },
  { texto: "Se muestra reacio a tener contacto visual conmigo o con otras personas.", cuadrante: "evitacion", seccion: "conductual" },
  { texto: "Requiere refuerzo positivo para volver a enfrentarse a los retos.", cuadrante: "evitacion", seccion: "conductual" },
  { texto: "Tiene fuertes arrebatos emocionales cuando no puede terminar una tarea.", cuadrante: "evitacion", seccion: "conductual" },
  { texto: "Le cuesta interpretar el lenguaje corporal o las expresiones faciales.", cuadrante: "sensibilidad", seccion: "conductual" },
  { texto: "Se frustra fácilmente.", cuadrante: "evitacion", seccion: "conductual" },
  { texto: "Tiene miedos que afectan a sus actividades diarias.", cuadrante: "evitacion", seccion: "conductual" },
  { texto: "Se angustia cuando cambian los planes, las rutinas o las expectativas.", cuadrante: "evitacion", seccion: "conductual" },
  { texto: "Necesita más protección en la vida que otros niños de su edad (p. ej., es indefenso física o emocionalmente).", cuadrante: "sensibilidad", seccion: "conductual" },
  { texto: "Interactúa o participa menos en los grupos que otros niños de su edad.", cuadrante: "evitacion", seccion: "conductual" },
  { texto: "Pierde el contacto visual conmigo cuando interactúo con él en el día a día.", cuadrante: "registro", seccion: "conductual" },
  { texto: "Le cuesta prestar atención.", cuadrante: "sensibilidad", seccion: "conductual" },
  { texto: "Aparta la mirada de sus tareas para observar lo que sucede a su alrededor.", cuadrante: "sensibilidad", seccion: "conductual" },
  { texto: "Se muestra indiferente en ambientes con mucha actividad (p. ej., ajeno a todo lo que ocurre).", cuadrante: "registro", seccion: "conductual" },
  { texto: "Observa a todas las personas que se mueven por la habitación.", cuadrante: "busqueda", seccion: "conductual" },
  { texto: "Pasa de hacer una cosa a hacer otra, tanto que afecta a sus actividades.", cuadrante: "busqueda", seccion: "conductual" },
  { texto: "Se pierde fácilmente.", cuadrante: "sensibilidad", seccion: "conductual" },
  { texto: "Lo pasa mal cuando ha de buscar algo en un entorno complejo (p. ej., zapatos en una habitación desordenada, un lápiz en un cajón lleno de trastos).", cuadrante: "registro", seccion: "conductual" },
];

const PERFIL_SENSORIAL_BREVE: TestDefinition = {
  id: "perfil_sensorial_breve",
  codigo: "PS2_BREVE",
  nombre: "Perfil Sensorial-2 · Breve (SSP)",
  tipo: "autoinforme",
  categoria: "autismo",
  grupo: "perfil_sensorial",
  nombreGrupo: "Perfil Sensorial 2",
  nombreVariante: "Breve (SSP)",
  descripcion:
    "Cuestionario para padres o cuidador, de 3:0 a 14:11 años (Winnie Dunn). Versión breve del " +
    "Perfil Sensorial-2.",
  instrucciones:
    "Marque la opción que describa mejor la frecuencia con la que el niño muestra cada " +
    "comportamiento cuando se le presenta la oportunidad.",
  algoritmoCalculo: "suma_por_dominio",
  requiereBaremo: false,
  dominios: ["busqueda", "evitacion", "sensibilidad", "registro"],
  activo: true,
  preguntas: PS_BREVE_ITEMS.map((item, i) => ({
    id: `psbreve_${i + 1}`,
    texto: item.texto,
    tipo: "likert" as const,
    dominio: item.cuadrante,
    ejesAdicionales: { seccion: item.seccion },
    opciones: psOpciones,
  })),
};

const PS_ESCOLAR_ITEMS: { texto: string; cuadrante: string; seccion?: string; factorEscolar: string }[] = [
  { texto: "Se pierde intentando seguir las instrucciones orales más que otros alumnos de su edad.", cuadrante: "registro", seccion: "auditivo", factorEscolar: "1" },
  { texto: "No me presta atención o parece ignorarme.", cuadrante: "registro", seccion: "auditivo", factorEscolar: "1" },
  { texto: "Le cuesta terminar las tareas en ambientes ruidosos.", cuadrante: "registro", seccion: "auditivo", factorEscolar: "3" },
  { texto: "Les dice a los demás que se callen.", cuadrante: "sensibilidad", seccion: "auditivo", factorEscolar: "2" },
  { texto: "Se angustia en las actividades grupales, a la hora de comer o en otros actos colectivos.", cuadrante: "evitacion", seccion: "auditivo", factorEscolar: "3" },
  { texto: "Reacciona intensamente a sonidos fuertes o inesperados (p. ej., alarma de incendio, libros que caen al suelo, portazos, avisos por megafonía, timbres).", cuadrante: "sensibilidad", seccion: "auditivo", factorEscolar: "3" },
  { texto: "Tiene dificultad para participar en actividades de grupo cuando hay muchas personas hablando.", cuadrante: "sensibilidad", seccion: "auditivo", factorEscolar: "3" },
  { texto: "Se pierde intentando seguir las instrucciones escritas o las demostraciones más que otros alumnos de su edad.", cuadrante: "registro", seccion: "visual", factorEscolar: "1" },
  { texto: "Le cuesta tener los materiales necesarios preparados para usarlos durante el día.", cuadrante: "registro", seccion: "visual", factorEscolar: "1" },
  { texto: "Deja en blanco respuestas de una hoja llena de ejercicios a pesar de sabérselas.", cuadrante: "registro", seccion: "visual", factorEscolar: "1" },
  { texto: "Mira a las personas que se mueven por la habitación.", cuadrante: "busqueda", seccion: "visual", factorEscolar: "2" },
  { texto: "Aparta la mirada de sus tareas para observar lo que sucede a su alrededor.", cuadrante: "sensibilidad", seccion: "visual", factorEscolar: "2" },
  { texto: "Pierde el contacto visual conmigo cuando interactúo con él en el día a día.", cuadrante: "registro", seccion: "visual", factorEscolar: "4" },
  { texto: "Le atraen las pantallas (TV, ordenador, móvil, etc.) con imágenes de colores vivos y en movimiento.", cuadrante: "busqueda", seccion: "visual", factorEscolar: "2" },
  { texto: "Se acerca demasiado a las personas cuando hablan cara a cara.", cuadrante: "busqueda", seccion: "tactil", factorEscolar: "1" },
  { texto: "Parece no darse cuenta de que tiene las manos o la cara sucias.", cuadrante: "registro", seccion: "tactil", factorEscolar: "1" },
  { texto: "Toca tanto a las personas o las cosas que llega a molestar a los demás.", cuadrante: "busqueda", seccion: "tactil", factorEscolar: "1" },
  { texto: "Muestra la necesidad de tocar cosas, superficies o texturas (p. ej., quiere tocarlo todo).", cuadrante: "busqueda", seccion: "tactil", factorEscolar: "2" },
  { texto: "Quiere limpiarse las manos rápidamente cuando hace alguna tarea que ensucia.", cuadrante: "sensibilidad", seccion: "tactil", factorEscolar: "2" },
  { texto: "Se enfada con facilidad si se hace un poco de daño (p. ej., al golpearse con algo, hacerse un rasguño o cortarse).", cuadrante: "sensibilidad", seccion: "tactil", factorEscolar: "2" },
  { texto: "Usa sólo las puntas de los dedos al realizar tareas de manipulación.", cuadrante: "sensibilidad", seccion: "tactil", factorEscolar: "3" },
  { texto: "Se estremece o se aparta cuando alguien lo toca o se le acerca mucho.", cuadrante: "evitacion", seccion: "tactil", factorEscolar: "3" },
  { texto: "No sujeta adecuadamente los materiales cuando trabaja (p. ej., no sujeta la hoja de papel en la que escribe).", cuadrante: "registro", seccion: "movimiento", factorEscolar: "4" },
  { texto: "Juega con las cosas o las toquetea (p. ej., lápices, libretas, carpetas).", cuadrante: "busqueda", seccion: "movimiento", factorEscolar: "1" },
  { texto: "Está inquieto o molesta a los demás cuando está de pie en una fila o cerca de otras personas (p. ej., al ir en autobús, entrar en la escuela, estar sentado en reuniones escolares, actividades grupales, etc.).", cuadrante: "sensibilidad", seccion: "movimiento", factorEscolar: "1" },
  { texto: "Se sienta incorrectamente en la silla (p. ej., repanchingado, curvado, medio tumbado).", cuadrante: "registro", seccion: "movimiento", factorEscolar: "1" },
  { texto: "Choca con las cosas, sin darse cuenta de los objetos o personas que hay en su camino.", cuadrante: "registro", seccion: "movimiento", factorEscolar: "1" },
  { texto: "No para quieto.", cuadrante: "busqueda", seccion: "movimiento", factorEscolar: "1" },
  { texto: "Parece tener un sinfín de razones para dirigirse al profesor.", cuadrante: "busqueda", seccion: "movimiento", factorEscolar: "2" },
  { texto: "Participa en las tareas o actividades físicamente activas con un ritmo más lento que otros alumnos de su edad.", cuadrante: "evitacion", seccion: "movimiento", factorEscolar: "4" },
  { texto: "Está de pie o sentado a un lado del patio durante el recreo.", cuadrante: "evitacion", factorEscolar: "4" },
  { texto: "Rechaza participar en los juegos de equipo (p. ej., fútbol, baloncesto).", cuadrante: "evitacion", factorEscolar: "4" },
  { texto: "Hace las cosas de una forma más complicada de lo necesario (p. ej., pierde el tiempo, se mueve lentamente).", cuadrante: "registro", seccion: "conductual", factorEscolar: "3" },
  { texto: "Parece cansado (p. ej., no tiene energía, está decaído).", cuadrante: "registro", seccion: "conductual", factorEscolar: "4" },
  { texto: "Podría decirse que reacciona de forma exagerada o dramática en comparación con otros alumnos de su edad.", cuadrante: "sensibilidad", seccion: "conductual", factorEscolar: "2" },
  { texto: "Carece de sentido del humor.", cuadrante: "evitacion", seccion: "conductual", factorEscolar: "4" },
  { texto: "Podría decirse que es inflexible en comparación con otros alumnos de su edad.", cuadrante: "evitacion", seccion: "conductual", factorEscolar: "4" },
  { texto: "Se angustia cuando cambian los planes, las rutinas o las expectativas.", cuadrante: "evitacion", seccion: "conductual", factorEscolar: "3" },
  { texto: "Puede ser terco y poco dispuesto a colaborar.", cuadrante: "sensibilidad", seccion: "conductual", factorEscolar: "3" },
  { texto: "Persevera en su conducta hasta el punto de afectar a la participación en actividades (p. ej., no es capaz de variar su velocidad o ritmo).", cuadrante: "evitacion", seccion: "conductual", factorEscolar: "3" },
  { texto: "Se retrae cuando cambia el entorno o una rutina.", cuadrante: "evitacion", seccion: "conductual", factorEscolar: "3" },
  { texto: "Se frustra fácilmente.", cuadrante: "evitacion", seccion: "conductual", factorEscolar: "3" },
  { texto: "Interactúa o participa menos en los grupos que otros alumnos de su edad.", cuadrante: "evitacion", seccion: "conductual", factorEscolar: "4" },
  { texto: "Le molesta que no se cumplan las reglas.", cuadrante: "sensibilidad", factorEscolar: "2" },
];

const PERFIL_SENSORIAL_ESCOLAR: TestDefinition = {
  id: "perfil_sensorial_escolar",
  codigo: "PS2_ESCOLAR",
  nombre: "Perfil Sensorial-2 · Escolar (3:0 a 14:11 años)",
  tipo: "autoinforme",
  categoria: "autismo",
  grupo: "perfil_sensorial",
  nombreGrupo: "Perfil Sensorial 2",
  nombreVariante: "Escolar (3-14 años)",
  descripcion:
    "Cuestionario para el profesor, de 3:0 a 14:11 años (Winnie Dunn). Además del Cuadrante " +
    "(Búsqueda/Evitación/Sensibilidad/Registro), clasifica cada ítem en una Sección sensorial " +
    "(Auditivo/Visual/Táctil/Movimiento/Conductual) y un Factor escolar (1 a 4).",
  instrucciones:
    "Marque la opción que describa mejor la frecuencia con la que el alumno muestra cada " +
    "comportamiento cuando se le presenta la oportunidad.",
  algoritmoCalculo: "suma_por_dominio",
  requiereBaremo: false,
  dominios: ["busqueda", "evitacion", "sensibilidad", "registro"],
  activo: true,
  preguntas: PS_ESCOLAR_ITEMS.map((item, i) => ({
    id: `psescolar_${i + 1}`,
    texto: item.texto,
    tipo: "likert" as const,
    dominio: item.cuadrante,
    ejesAdicionales: {
      factorEscolar: item.factorEscolar,
      ...(item.seccion ? { seccion: item.seccion } : {}),
    },
    opciones: psOpciones,
  })),
};

const CATALOGO: TestDefinition[] = [
  PHQ9,
  GAD7,
  VARK,
  ZAVIC,
  CLEAVER,
  PROCESO_PENSANTE,
  VALORES_PERSONALES,
  BDI2,
  MCHAT,
  PF16,
  ABC,
  ADOS2,
  PERFIL_SENSORIAL_BREVE,
  PERFIL_SENSORIAL_ESCOLAR,
];

const BAREMOS_EJEMPLO: NormativeTable[] = [
  {
    id: "bdi2_18_30_ambos",
    testId: "bdi2",
    edadMin: 18,
    edadMax: 30,
    sexo: "ambos",
    dominio: "total",
    tablaConversion: { "0": 5, "10": 40, "20": 70, "30": 90, "40": 97, "63": 99 },
  },
];

async function main() {
  const batch = db.batch();

  for (const test of CATALOGO) {
    batch.set(db.collection("tests").doc(test.id), test);
  }
  for (const tabla of BAREMOS_EJEMPLO) {
    batch.set(db.collection("normative_tables").doc(tabla.id), tabla);
  }

  await batch.commit();
  console.log(`Catálogo cargado: ${CATALOGO.length} tests, ${BAREMOS_EJEMPLO.length} tablas de baremo.`);
}

main().catch((err) => {
  console.error("Error al ejecutar el seed:", err);
  process.exit(1);
});
