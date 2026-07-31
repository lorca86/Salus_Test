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

// Versión completa para padres/cuidadores ("Niño"), 86 ítems en 9 secciones.
// 6 ítems (10, 11, 17, 29, 42, 43) no están asignados a ningún Cuadrante
// según la tabla oficial de corrección — solo cuentan para su Sección.
const PS_NINO_ITEMS: { texto: string; cuadrante?: string; seccion?: string }[] = [
  { texto: "Reacciona fuertemente a sonidos inesperados o altos (por ejemplo, sirenas, perros ladrando, secadora de pelo, etc.).", cuadrante: "evitacion", seccion: "auditivo" },
  { texto: "Se cubre los oídos con las manos para protegerlos de sonidos.", cuadrante: "evitacion", seccion: "auditivo" },
  { texto: "Le cuesta trabajo completar las tareas cuando hay música o la televisión está prendida.", cuadrante: "sensibilidad", seccion: "auditivo" },
  { texto: "Se distrae cuando hay mucho ruido a su alrededor.", cuadrante: "sensibilidad", seccion: "auditivo" },
  { texto: "Se vuelve improductivo(a) con el ruido de fondo (por ejemplo, ventilador, refrigerador, etc.).", cuadrante: "evitacion", seccion: "auditivo" },
  { texto: "Parece ignorarme o no escuchar lo que estoy diciendo.", cuadrante: "sensibilidad", seccion: "auditivo" },
  { texto: "Parece no oír cuando lo(a) llamo por su nombre (a pesar de que puede oír bien).", cuadrante: "sensibilidad", seccion: "auditivo" },
  { texto: "Disfruta de ruidos extraños o hace ruido(s) solo por diversión.", cuadrante: "registro", seccion: "auditivo" },

  { texto: "Prefiere jugar o trabajar con poca iluminación.", cuadrante: "sensibilidad", seccion: "visual" },
  { texto: "Prefiere estampados o colores brillantes para la ropa.", seccion: "visual" },
  { texto: "Disfruta viendo los detalles visuales en los objetos.", seccion: "visual" },
  { texto: "Necesita ayuda para encontrar objetos que son evidentes para otras personas.", cuadrante: "registro", seccion: "visual" },
  { texto: "Le molestan las luces brillante más que a otros niños(as) de su edad.", cuadrante: "sensibilidad", seccion: "visual" },
  { texto: "Observa a las personas mientras se mueven alrededor de la habitación.", cuadrante: "busqueda", seccion: "visual" },
  { texto: "Le molestan las luces brillantes (por ejemplo, se esconde de la luz del sol que entra por la ventana).", cuadrante: "evitacion" },

  { texto: "Muestra angustia cuando le arreglan (por ejemplo, pelea o llora cuando le cortan el pelo, le lavan la cara, le cortan las uñas, etc.).", cuadrante: "sensibilidad", seccion: "tactil" },
  { texto: "Le irrita usar zapatos o calcetines.", seccion: "tactil" },
  { texto: "Muestra una reacción emocional o agresiva cuando alguien lo(a) toca.", cuadrante: "evitacion", seccion: "tactil" },
  { texto: "Se pone ansioso(a) al estar de pie cerca de otros (por ejemplo, esperar en la fila).", cuadrante: "sensibilidad", seccion: "tactil" },
  { texto: "Se frota o se rasca la parte del cuerpo donde le han tocado.", cuadrante: "sensibilidad", seccion: "tactil" },
  { texto: "Toca personas u objetos al grado de molestar a otras personas.", cuadrante: "busqueda", seccion: "tactil" },
  { texto: "Muestra necesidad de tocar juguetes, superficies o texturas (por ejemplo, quiere experimentar la sensación de todo).", cuadrante: "busqueda", seccion: "tactil" },
  { texto: "Parece no darse cuenta del dolor.", cuadrante: "registro", seccion: "tactil" },
  { texto: "Parece no darse cuenta de los cambios de temperatura.", cuadrante: "registro", seccion: "tactil" },
  { texto: "Toca personas u objetos más que otros niños(as) de su misma edad.", cuadrante: "busqueda", seccion: "tactil" },
  { texto: "Parece no estar consciente de tener la cara o las manos sucias.", cuadrante: "registro", seccion: "tactil" },

  { texto: "Procura estar en movimiento hasta el grado que llega a interferir con sus actividades diarias (por ejemplo, no puede quedarse quieto(a) o estar sentado(a) sin moverse).", cuadrante: "busqueda", seccion: "movimiento" },
  { texto: "Se mece sentado(a) en una silla, en el piso o estando de pie.", cuadrante: "busqueda", seccion: "movimiento" },
  { texto: "Titubea al subir o bajar de la acera/banqueta o de escalones (por ejemplo, es cauteloso(a), se detiene antes de moverse).", seccion: "movimiento" },
  { texto: "Se emociona cuando realiza tareas que implican movimiento.", cuadrante: "busqueda", seccion: "movimiento" },
  { texto: "Toma riesgos al trepar/escalar o hacer movimientos que no son seguros.", cuadrante: "busqueda", seccion: "movimiento" },
  { texto: "Busca oportunidades de caerse, sin considerar su propia seguridad (por ejemplo, se cae a propósito).", cuadrante: "busqueda", seccion: "movimiento" },
  { texto: "Cuando camina en terrenos desnivelados, pierde el equilibrio inesperadamente.", cuadrante: "registro", seccion: "movimiento" },
  { texto: "Choca con las cosas, sin darse cuenta de los objetos o personas que están en su camino.", cuadrante: "registro", seccion: "movimiento" },

  { texto: "Se mueve de manera rígida.", cuadrante: "registro", seccion: "posicion_cuerpo" },
  { texto: "Se cansa fácilmente, especialmente cuando está de pie o sosteniendo el cuerpo en una posición.", cuadrante: "registro", seccion: "posicion_cuerpo" },
  { texto: "Parece tener músculos débiles.", cuadrante: "registro", seccion: "posicion_cuerpo" },
  { texto: "Necesita apoyo para soportarse a sí mismo (por ejemplo, sostiene la cabeza con sus manos, se recarga en la pared, etc.).", cuadrante: "registro", seccion: "posicion_cuerpo" },
  { texto: "Se aferra a objetos, paredes o barandillas más que otros niños(as) de la misma edad.", cuadrante: "registro", seccion: "posicion_cuerpo" },
  { texto: "Hace ruido al caminar como si le pesaran los pies.", cuadrante: "registro", seccion: "posicion_cuerpo" },
  { texto: "Se estira echándose sobre muebles o encima de la gente.", cuadrante: "busqueda", seccion: "posicion_cuerpo" },
  { texto: "Necesita cobijas/frazadas gruesas para dormir.", seccion: "posicion_cuerpo" },

  { texto: "Tiene el reflejo del vómito (por ejemplo, con la textura de la comida o los cubiertos en la boca).", seccion: "sensorial_oral" },
  { texto: "Rechaza ciertos sabores u olores de comida que forman parte de la dieta típica infantil.", cuadrante: "sensibilidad", seccion: "sensorial_oral" },
  { texto: "Solo come ciertos sabores (por ejemplo, dulce o salado).", cuadrante: "sensibilidad", seccion: "sensorial_oral" },
  { texto: "Se limita a sí mismo/a a solo ciertas texturas de comida.", cuadrante: "sensibilidad", seccion: "sensorial_oral" },
  { texto: "Es particular o exigente para comer, especialmente en lo que se refiere a la textura de la comida.", cuadrante: "sensibilidad", seccion: "sensorial_oral" },
  { texto: "Huele objetos que no son comidas.", cuadrante: "busqueda", seccion: "sensorial_oral" },
  { texto: "Muestra una fuerte preferencia hacia ciertos sabores.", cuadrante: "busqueda", seccion: "sensorial_oral" },
  { texto: "Se le antojan ciertos alimentos, sabores u olores.", cuadrante: "busqueda", seccion: "sensorial_oral" },
  { texto: "Se mete objetos a la boca (por ejemplo, lápiz, manos, etc.).", cuadrante: "busqueda", seccion: "sensorial_oral" },
  { texto: "Se muerde la lengua o los labios, más que otros niños(as) de su misma edad.", cuadrante: "sensibilidad", seccion: "sensorial_oral" },

  { texto: "Parece ser propenso a los accidentes.", cuadrante: "registro", seccion: "conducta" },
  { texto: "Se apresura cuando pinta, escribe o dibuja.", cuadrante: "registro", seccion: "conducta" },
  { texto: "Toma riesgos excesivos comprometiendo su propia seguridad (por ejemplo, se trepa en un árbol alto, brinca de muebles altos, etc.).", cuadrante: "busqueda", seccion: "conducta" },
  { texto: "Parece ser más activo(a) que otros niños(as) de su edad.", cuadrante: "busqueda", seccion: "conducta" },
  { texto: "Hace las cosas más difíciles de lo que es necesario (por ejemplo, desperdicia el tiempo, se mueve con lentitud, etc.).", cuadrante: "registro", seccion: "conducta" },
  { texto: "Puede ser terco(a), necio(a), y poco cooperativo(o).", cuadrante: "evitacion", seccion: "conducta" },
  { texto: "Hace berrinches.", cuadrante: "evitacion", seccion: "conducta" },
  { texto: "Parece disfrutar de las caídas.", cuadrante: "busqueda", seccion: "conducta" },
  { texto: "Se resiste al contacto visual mío o de los demás.", cuadrante: "evitacion", seccion: "conducta" },

  { texto: "Parece tener una baja autoestima (por ejemplo, dificultad para sentirse bien consigo mismo(a)).", cuadrante: "registro", seccion: "emocional_social" },
  { texto: "Requiere de apoyo positivo para responder a situaciones desafiantes.", cuadrante: "evitacion", seccion: "emocional_social" },
  { texto: "Es sensible a las críticas.", cuadrante: "evitacion", seccion: "emocional_social" },
  { texto: "Tiene miedos predecibles y definidos.", cuadrante: "evitacion", seccion: "emocional_social" },
  { texto: "Manifiesta sentirse como un fracaso.", cuadrante: "evitacion", seccion: "emocional_social" },
  { texto: "Es muy serio(a).", cuadrante: "evitacion", seccion: "emocional_social" },
  { texto: "Tiene fuertes arrebatos emocionales cuando no puede completar una tarea.", cuadrante: "evitacion", seccion: "emocional_social" },
  { texto: "Le cuesta trabajo interpretar el lenguaje corporal o las expresiones faciales.", cuadrante: "sensibilidad", seccion: "emocional_social" },
  { texto: "Se frustra fácilmente.", cuadrante: "evitacion", seccion: "emocional_social" },
  { texto: "Tiene temores que interfieren con la rutina cotidiana.", cuadrante: "evitacion", seccion: "emocional_social" },
  { texto: "Se angustia cuando hay cambios en los planes, rutinas o expectativas.", cuadrante: "evitacion", seccion: "emocional_social" },
  { texto: "Necesita más protección de la vida que otros niños(as) de su misma edad (por ejemplo, es indefenso/a física o emocionalmente).", cuadrante: "sensibilidad", seccion: "emocional_social" },
  { texto: "Interactúa o participa en grupos menos que otros niños(as) de su edad.", cuadrante: "evitacion", seccion: "emocional_social" },
  { texto: "Tiene dificultades con las amistades (por ejemplo, hacer o retener amigos).", cuadrante: "evitacion", seccion: "emocional_social" },

  { texto: "Tiene muy poco contacto visual conmigo durante nuestras interacciones diarias.", cuadrante: "registro", seccion: "atencion" },
  { texto: "Tiene dificultad para poner atención.", cuadrante: "sensibilidad", seccion: "atencion" },
  { texto: "Aparta la vista de sus tareas para observar todas las actividades en la habitación.", cuadrante: "sensibilidad", seccion: "atencion" },
  { texto: "Parece no estar consciente de un ambiente activo (por ejemplo, no se da cuenta de las actividades que ocurren).", cuadrante: "registro", seccion: "atencion" },
  { texto: "Mira fijamente a los objetos.", cuadrante: "registro", seccion: "atencion" },
  { texto: "Mira fijamente a las personas.", cuadrante: "evitacion", seccion: "atencion" },
  { texto: "Observa a todas las personas que se mueven alrededor de la habitación.", cuadrante: "busqueda", seccion: "atencion" },
  { texto: "Brinca de una cosa a otra a tal grado que interfiere con las actividades.", cuadrante: "busqueda", seccion: "atencion" },
  { texto: "Se pierde fácilmente.", cuadrante: "sensibilidad", seccion: "atencion" },
  { texto: "Le cuesta trabajo encontrar cosas en situaciones que complican el problema (por ejemplo, zapatos en un cuarto desordenado, lápiz en un cajón lleno de trastos, etc.).", cuadrante: "registro", seccion: "atencion" },
  { texto: "Parece no darse cuenta cuando las personas entran a la habitación.", cuadrante: "registro" },
];

const PERFIL_SENSORIAL_NINO: TestDefinition = {
  id: "perfil_sensorial_nino",
  codigo: "PS2_NINO",
  nombre: "Perfil Sensorial-2 · Niño (padres/cuidadores, 3:0 a 14:11 años)",
  tipo: "autoinforme",
  categoria: "autismo",
  grupo: "perfil_sensorial",
  nombreGrupo: "Perfil Sensorial 2",
  nombreVariante: "Niño · Padres/cuidadores (86 ítems)",
  descripcion:
    "Cuestionario completo para padres o cuidadores, de 3:0 a 14:11 años (Winnie Dunn). Versión " +
    "extendida (86 ítems, 9 secciones sensoriales/conductuales) del Perfil Sensorial-2.",
  instrucciones:
    "Marque la opción que describa mejor la frecuencia con la que el niño(a) muestra cada " +
    "comportamiento cuando se le presenta la oportunidad.",
  algoritmoCalculo: "suma_por_dominio",
  requiereBaremo: false,
  dominios: ["busqueda", "evitacion", "sensibilidad", "registro"],
  activo: true,
  preguntas: PS_NINO_ITEMS.map((item, i) => ({
    id: `psnino_${i + 1}`,
    texto: item.texto,
    tipo: "likert" as const,
    ...(item.cuadrante ? { dominio: item.cuadrante } : {}),
    ejesAdicionales: { ...(item.seccion ? { seccion: item.seccion } : {}) },
    opciones: psOpciones,
  })),
};

// ---------------------------------------------------------------------------
// ADOS-2 (Autism Diagnostic Observation Schedule, 2ª ed.; Lord et al.
// © Western Psychological Services / adaptación española © TEA Ediciones).
// Instrumento de uso restringido: cargado con contenido y algoritmo
// oficiales proporcionados por el usuario, quien confirmó contar con la
// certificación clínica ADOS-2 y la licencia requeridas para su uso — no
// solo la posesión del cuadernillo.
//
// Se registran únicamente el nombre corto de cada ítem y una etiqueta breve
// por código (no el texto extenso de "aspectos a observar" ni las
// definiciones conductuales completas del manual): la aplicación es una
// herramienta de registro y cálculo para un evaluador ya certificado, no un
// sustituto del cuadernillo/manual de entrenamiento clínico.
//
// El algoritmo (conversión de códigos, dominios AS/CRR y tablas de corte)
// vive en lib/scoring/custom/ados2.ts, ya que no es una suma genérica por
// dominio como el resto del catálogo.
const ADOS2T_ITEMS: {
  id: string;
  seccion: string;
  texto: string;
  opciones: { valor: number; etiqueta: string }[];
}[] = [
  { id: "a1", seccion: "A. Lenguaje y comunicación", texto: "A1. Nivel general de lenguaje oral no ecolálico", opciones: [
    { valor: 0, etiqueta: "Uso regular de verbalizaciones de dos o más palabras" },
    { valor: 1, etiqueta: "Solo uso ocasional de frases; en general palabras sueltas" },
    { valor: 2, etiqueta: "Solo palabras sueltas o aproximaciones (mín. 5 distintas)" },
    { valor: 3, etiqueta: "Al menos una palabra/aproximación, menos de 5 en la sesión" },
    { valor: 4, etiqueta: "No hay palabras ni aproximaciones" },
  ]},
  { id: "a1a", seccion: "A. Lenguaje y comunicación", texto: "A1a. Frecuencia del balbuceo", opciones: [
    { valor: 0, etiqueta: "Reduplicaciones frecuentes de consonantes o vocales" },
    { valor: 1, etiqueta: "Sonidos de una sola sílaba frecuentes" },
    { valor: 2, etiqueta: "Sonidos de una sola sílaba ocasionales" },
    { valor: 3, etiqueta: "No hay balbuceo (solo sonidos vocales)" },
    { valor: 8, etiqueta: "Demasiado lenguaje para codificar el balbuceo" },
  ]},
  { id: "a2", seccion: "A. Lenguaje y comunicación", texto: "A2. Frecuencia de la vocalización espontánea dirigida a otros", opciones: [
    { valor: 0, etiqueta: "Dirige vocalizaciones en varios contextos pragmáticos" },
    { valor: 1, etiqueta: "Dirige vocalizaciones inconsistentemente en varios contextos" },
    { valor: 2, etiqueta: "Dirige vocalizaciones consistentemente en un solo contexto" },
    { valor: 3, etiqueta: "Vocalización esporádica o casi nunca dirigida" },
  ]},
  { id: "a3", seccion: "A. Lenguaje y comunicación", texto: "A3. Entonación de las vocalizaciones o verbalizaciones", opciones: [
    { valor: 0, etiqueta: "Entonación normal, con variación apropiada" },
    { valor: 1, etiqueta: "Entonación rara pero no tan clara como códigos 2 y 3" },
    { valor: 2, etiqueta: "Entonación rara o tono/acento inapropiados" },
    { valor: 3, etiqueta: "Entonación en su mayor parte rara o inapropiada" },
    { valor: 8, etiqueta: "N/A (vocalizaciones insuficientes para evaluar)" },
  ]},
  { id: "a4", seccion: "A. Lenguaje y comunicación", texto: "A4. Ecolalia inmediata", opciones: [
    { valor: 0, etiqueta: "No repite el habla del adulto" },
    { valor: 1, etiqueta: "Eco ocasional del lenguaje" },
    { valor: 2, etiqueta: "Repite con frecuencia, pero también lenguaje espontáneo" },
    { valor: 3, etiqueta: "El habla consiste principalmente en ecolalia inmediata" },
    { valor: 8, etiqueta: "No percibida; lenguaje demasiado limitado para valorar" },
  ]},
  { id: "a5", seccion: "A. Lenguaje y comunicación", texto: "A5. Uso estereotipado o idiosincrásico de palabras o frases", opciones: [
    { valor: 0, etiqueta: "Nunca o casi nunca usa palabras/frases estereotipadas" },
    { valor: 1, etiqueta: "Tiende a ser más repetitivo que la mayoría, no claramente raro" },
    { valor: 2, etiqueta: "A menudo vocalizaciones estereotipadas o palabras raras" },
    { valor: 3, etiqueta: "Frecuente habla rara/estereotipada, raramente espontánea" },
    { valor: 8, etiqueta: "Lenguaje demasiado limitado para valorar" },
  ]},
  { id: "a6", seccion: "A. Lenguaje y comunicación", texto: "A6. Uso del cuerpo de otro", opciones: [
    { valor: 0, etiqueta: "No utiliza el cuerpo de otro para un objetivo concreto" },
    { valor: 1, etiqueta: "Toma la mano del adulto sin mirada/contacto visual coordinado" },
    { valor: 2, etiqueta: "Mueve la mano de otro mientras sostiene un objeto" },
    { valor: 3, etiqueta: "Coloca la mano/cuerpo del adulto sobre un objeto" },
    { valor: 8, etiqueta: "N/A" },
  ]},
  { id: "a7", seccion: "A. Lenguaje y comunicación", texto: "A7. Señalar", opciones: [
    { valor: 0, etiqueta: "Señala con dedo índice, mirada coordinada, en ≥2 actividades" },
    { valor: 1, etiqueta: "Señala para referirse a objetos, sin flexibilidad/frecuencia de 0" },
    { valor: 2, etiqueta: "Señala solo al tocar el objeto, sin mirada/vocalización" },
    { valor: 3, etiqueta: "No señala objetos de ninguna manera" },
  ]},
  { id: "a8", seccion: "A. Lenguaje y comunicación", texto: "A8. Gestos", opciones: [
    { valor: 0, etiqueta: "Uso espontáneo de al menos 3 gestos distintos" },
    { valor: 1, etiqueta: "Uso espontáneo de 2 gestos, o 3+ usados en 1 sola actividad" },
    { valor: 2, etiqueta: "Solo un gesto espontáneo, o solo gestos solicitados/imitados" },
    { valor: 3, etiqueta: "Sin uso espontáneo/solicitado/imitado de gestos, o solo inapropiado" },
    { valor: 8, etiqueta: "N/A" },
  ]},
  { id: "a9", seccion: "A. Lenguaje y comunicación", texto: "A9. Frecuencia de vocalización no dirigida", opciones: [
    { valor: 0, etiqueta: "Pocas vocalizaciones no dirigidas" },
    { valor: 1, etiqueta: "Varias en una actividad, o infrecuentes en varias" },
    { valor: 2, etiqueta: "Frecuentes; puede incluir también dirigidas" },
    { valor: 3, etiqueta: "Frecuentes y casi todas no dirigidas" },
    { valor: 8, etiqueta: "Nunca o casi nunca vocaliza" },
  ]},
  { id: "b1", seccion: "B. Interacción social recíproca", texto: "B1. Contacto visual inusual", opciones: [
    { valor: 0, etiqueta: "Mirada apropiada, cambios sutiles con otra comunicación" },
    { valor: 1, etiqueta: "Mirada dirigida evidente pero no consistente" },
    { valor: 2, etiqueta: "Contacto visual modulado de manera pobre" },
    { valor: 3, etiqueta: "Modulado pobremente y evita activamente el contacto visual" },
  ]},
  { id: "b2", seccion: "B. Interacción social recíproca", texto: "B2. Juego de broma", opciones: [
    { valor: 0, etiqueta: "Contacto visual en los dos ensayos" },
    { valor: 1, etiqueta: "Contacto visual en un solo ensayo" },
    { valor: 2, etiqueta: "No hay contacto visual, pero muestra conciencia de la situación" },
    { valor: 3, etiqueta: "Mueve la mano del examinador sin mirar, o no responde" },
    { valor: 8, etiqueta: "N/A" },
  ]},
  { id: "b3", seccion: "B. Interacción social recíproca", texto: "B3. Juego imposible", opciones: [
    { valor: 0, etiqueta: "Contacto visual en los dos ensayos" },
    { valor: 1, etiqueta: "Contacto visual en un solo ensayo" },
    { valor: 2, etiqueta: "No hay contacto visual, pero muestra conciencia de la situación" },
    { valor: 3, etiqueta: "Mueve la mano del examinador sin mirar, o no responde" },
    { valor: 8, etiqueta: "N/A" },
  ]},
  { id: "b4", seccion: "B. Interacción social recíproca", texto: "B4. Expresiones faciales dirigidas a otros", opciones: [
    { valor: 0, etiqueta: "Dirige diversas expresiones faciales apropiadas" },
    { valor: 1, etiqueta: "Dirige algunas expresiones faciales" },
    { valor: 2, etiqueta: "Cierta variedad pero poco dirigidas, o una sola expresión" },
    { valor: 3, etiqueta: "Variedad limitada y no dirigidas" },
  ]},
  { id: "b5", seccion: "B. Interacción social recíproca", texto: "B5. Integración de la mirada y otras conductas en iniciaciones sociales", opciones: [
    { valor: 0, etiqueta: "Contacto visual adecuado junto con palabras/vocalizaciones/gestos" },
    { valor: 1, etiqueta: "Usa varias estrategias en momentos diferentes, sin coordinarlas" },
    { valor: 2, etiqueta: "Usa principalmente una estrategia, sin integrarla" },
    { valor: 3, etiqueta: "Pocas veces alguna estrategia, o no hay iniciaciones sociales" },
  ]},
  { id: "b6", seccion: "B. Interacción social recíproca", texto: "B6. Disfrute compartido durante la interacción", opciones: [
    { valor: 0, etiqueta: "Muestras claras de disfrute, adecuadas, en más de una actividad" },
    { valor: 1, etiqueta: "Muestras claras de disfrute en una sola interacción" },
    { valor: 2, etiqueta: "Cierto disfrute apropiado, o con el familiar/cuidador" },
    { valor: 3, etiqueta: "Poco o ningún disfrute en la interacción" },
  ]},
  { id: "b7", seccion: "B. Interacción social recíproca", texto: "B7. Respuesta al nombre", opciones: [
    { valor: 0, etiqueta: "Mira la cara del examinador en 1 de las 2 primeras presiones" },
    { valor: 1, etiqueta: "Mira tras el 1º-2º intento (familiar) o 3º-4º (examinador)" },
    { valor: 2, etiqueta: "Solo mira tras vocalización interesante o familiar" },
    { valor: 3, etiqueta: "No mira tras ningún intento puramente verbal/oral" },
  ]},
  { id: "b8", seccion: "B. Interacción social recíproca", texto: "B8. Ignorar", opciones: [
    { valor: 0, etiqueta: "Demanda de atención clara, mirada y vocalización integradas" },
    { valor: 1, etiqueta: "Demanda clara pero sin integrar mirada/vocalización/gestos" },
    { valor: 2, etiqueta: "Mira, vocaliza o gesticula; o demanda de atención dudosa" },
    { valor: 3, etiqueta: "Comportamiento agitado o no dirigido" },
  ]},
  { id: "b9", seccion: "B. Interacción social recíproca", texto: "B9. Pedir", opciones: [
    { valor: 0, etiqueta: "Integración apropiada de contacto visual + otro comportamiento" },
    { valor: 1, etiqueta: "Comportamientos del código 0 pero solo en una actividad" },
    { valor: 2, etiqueta: "Pide sin integrar el contacto visual con otros comportamientos" },
    { valor: 3, etiqueta: "No hace una petición directa" },
  ]},
  { id: "b10", seccion: "B. Interacción social recíproca", texto: "B10. Cantidad de peticiones", opciones: [
    { valor: 0, etiqueta: "Peticiones frecuentes a lo largo de las actividades" },
    { valor: 1, etiqueta: "Peticiones pocas veces a lo largo de las actividades" },
    { valor: 2, etiqueta: "Peticiones solo en una actividad" },
    { valor: 3, etiqueta: "No realiza peticiones o solo confusas" },
  ]},
  { id: "b11", seccion: "B. Interacción social recíproca", texto: "B11. Dar", opciones: [
    { valor: 0, etiqueta: "Entrega espontáneamente juguetes/objetos con propósito de compartir" },
    { valor: 1, etiqueta: "Da objetos de manera consistente para recibir ayuda o intención ambigua" },
    { valor: 2, etiqueta: "Da objetos a veces, como código 1" },
    { valor: 3, etiqueta: "Nunca o casi nunca da algo a otra persona" },
  ]},
  { id: "b12", seccion: "B. Interacción social recíproca", texto: "B12. Mostrar", opciones: [
    { valor: 0, etiqueta: "Muestra espontáneamente juguetes/objetos con contacto visual" },
    { valor: 1, etiqueta: "Solo un ejemplo claro de mostrar, como código 0" },
    { valor: 2, etiqueta: "Muestra de manera parcial o inconsistente" },
    { valor: 3, etiqueta: "No muestra objetos a otra persona" },
  ]},
  { id: "b13", seccion: "B. Interacción social recíproca", texto: "B13. Iniciación espontánea de la atención conjunta", opciones: [
    { valor: 0, etiqueta: "Contacto visual integrado para dirigir la atención a un objeto lejano" },
    { valor: 1, etiqueta: "Mira el objeto y al adulto, pero no vuelve a mirar el objeto" },
    { valor: 2, etiqueta: "Referencias parciales a un objeto fuera de alcance" },
    { valor: 3, etiqueta: "No hay aproximación a iniciación espontánea de atención conjunta" },
  ]},
  { id: "b14", seccion: "B. Interacción social recíproca", texto: "B14. Respuesta a la atención conjunta", opciones: [
    { valor: 0, etiqueta: "Sigue la orientación de ojos/cara del examinador sin necesidad de señalar" },
    { valor: 1, etiqueta: "Sigue la acción de señalar del examinador" },
    { valor: 2, etiqueta: "No sigue mirada/señalar, pero mira el objeto al activarse" },
    { valor: 3, etiqueta: "No se orienta hacia el objeto ni cuando se activa" },
  ]},
  { id: "b15", seccion: "B. Interacción social recíproca", texto: "B15. Características de las iniciaciones sociales", opciones: [
    { valor: 0, etiqueta: "Uso efectivo de formas no verbales/verbales, iniciaciones claras" },
    { valor: 1, etiqueta: "Iniciaciones con características ligeramente inusuales" },
    { valor: 2, etiqueta: "A menudo carecen de integración en el contexto o de naturaleza social" },
    { valor: 3, etiqueta: "No hay iniciaciones sociales de ningún tipo" },
  ]},
  { id: "b16a", seccion: "B. Interacción social recíproca", texto: "B16a. Cantidad de iniciaciones/mantenimiento de atención: Examinador", opciones: [
    { valor: 0, etiqueta: "Intentos frecuentes de captar/mantener/dirigir la atención" },
    { valor: 1, etiqueta: "Algunos intentos, con escasa frecuencia o en pocas actividades" },
    { valor: 2, etiqueta: "Intentos ocasionales, incluyendo solo buscar consuelo" },
    { valor: 3, etiqueta: "Relativamente poca preocupación por la atención del examinador" },
    { valor: 7, etiqueta: "Demandas de atención inusualmente frecuentes o excesivas" },
  ]},
  { id: "b16b", seccion: "B. Interacción social recíproca", texto: "B16b. Cantidad de iniciaciones/mantenimiento de atención: Familiar o cuidador", opciones: [
    { valor: 0, etiqueta: "Intentos frecuentes de captar/mantener/dirigir la atención" },
    { valor: 1, etiqueta: "Algunos intentos, con escasa frecuencia o en pocas actividades" },
    { valor: 2, etiqueta: "Intentos ocasionales, incluyendo solo buscar consuelo" },
    { valor: 3, etiqueta: "Relativamente poca preocupación por la atención del familiar" },
    { valor: 7, etiqueta: "Demandas de atención inusualmente frecuentes o excesivas" },
    { valor: 8, etiqueta: "El familiar o cuidador no estuvo presente" },
  ]},
  { id: "b17", seccion: "B. Interacción social recíproca", texto: "B17. Nivel de implicación", opciones: [
    { valor: 0, etiqueta: "Se implica espontáneamente y consistentemente" },
    { valor: 1, etiqueta: "Se implica espontáneamente de forma inconsistente" },
    { valor: 2, etiqueta: "Solo cuando el examinador se esfuerza en obtener su interés" },
    { valor: 3, etiqueta: "No se implica ni con esfuerzo, salvo con contacto físico" },
  ]},
  { id: "b18", seccion: "B. Interacción social recíproca", texto: "B18. Calidad general de la relación", opciones: [
    { valor: 0, etiqueta: "Interacción agradable y apropiada" },
    { valor: 1, etiqueta: "Agradable a veces, no de forma sostenida" },
    { valor: 2, etiqueta: "Unilateral o inusual, sesión ligeramente incómoda" },
    { valor: 3, etiqueta: "Consideración mínima, observación marcadamente difícil" },
  ]},
  { id: "c1", seccion: "C. Juego", texto: "C1. Juego funcional con objetos", opciones: [
    { valor: 0, etiqueta: "Juega espontáneamente con diversos juguetes convencionalmente" },
    { valor: 1, etiqueta: "Algo de juego funcional espontáneo con al menos una miniatura" },
    { valor: 2, etiqueta: "Solo juguetes de causa-efecto/construcción, o empuja el coche" },
    { valor: 3, etiqueta: "No juega, o solo de manera estereotipada" },
  ]},
  { id: "c2", seccion: "C. Juego", texto: "C2. Imaginación y creatividad", opciones: [
    { valor: 0, etiqueta: "Usa espontáneamente la muñeca/objetos como agentes independientes" },
    { valor: 1, etiqueta: "Juego simbólico espontáneo con la muñeca, sin agente independiente" },
    { valor: 2, etiqueta: "Imita el juego simbólico, pero no espontáneo" },
    { valor: 3, etiqueta: "No hay juego simbólico espontáneo ni imitado" },
  ]},
  { id: "c3", seccion: "C. Juego", texto: "C3. Imitación funcional y simbólica", opciones: [
    { valor: 0, etiqueta: "Usa el sustituto como objeto no presentado previamente" },
    { valor: 1, etiqueta: "Usa el sustituto como objeto ya presentado previamente" },
    { valor: 2, etiqueta: "Imita el uso de un objeto real previamente presentado" },
    { valor: 3, etiqueta: "No se produce imitación" },
  ]},
  { id: "d1", seccion: "D. Comportamientos estereotipados e intereses restringidos", texto: "D1. Interés sensorial inusual en materiales de juego o personas", opciones: [
    { valor: 0, etiqueta: "No presenta intereses sensoriales inusuales" },
    { valor: 1, etiqueta: "Varios posibles pero no tan claros como código 2" },
    { valor: 2, etiqueta: "Interés evidente por elementos sensoriales, o examen sensorial" },
    { valor: 3, etiqueta: "Comportamientos evidentes en ≥2 actividades, pueden interferir" },
  ]},
  { id: "d2", seccion: "D. Comportamientos estereotipados e intereses restringidos", texto: "D2. Movimientos de manos y dedos / postura", opciones: [
    { valor: 0, etiqueta: "Ninguno" },
    { valor: 1, etiqueta: "Movimientos inusuales/repetitivos no tan claros como 2 y 3" },
    { valor: 2, etiqueta: "Manierismos evidentes, breves o infrecuentes" },
    { valor: 3, etiqueta: "Ocurren frecuentemente en ≥2 actividades, pueden interferir" },
  ]},
  { id: "d3", seccion: "D. Comportamientos estereotipados e intereses restringidos", texto: "D3. Otros manierismos complejos", opciones: [
    { valor: 0, etiqueta: "Ninguno" },
    { valor: 1, etiqueta: "Inusuales/repetitivos no tan claros como 2 y 3" },
    { valor: 2, etiqueta: "Manierismos complejos evidentes, breves o infrecuentes" },
    { valor: 3, etiqueta: "Ocurren frecuentemente en ≥2 actividades, pueden interferir" },
  ]},
  { id: "d4", seccion: "D. Comportamientos estereotipados e intereses restringidos", texto: "D4. Conducta autolesiva", opciones: [
    { valor: 0, etiqueta: "No intenta autolesionarse" },
    { valor: 1, etiqueta: "Autolesión dudosa o posible" },
    { valor: 2, etiqueta: "Autolesión infrecuente pero clara" },
    { valor: 3, etiqueta: "Más de un ejemplo claro de autolesión" },
  ]},
  { id: "d5", seccion: "D. Comportamientos estereotipados e intereses restringidos", texto: "D5. Intereses inusualmente repetitivos o comportamientos estereotipados", opciones: [
    { valor: 0, etiqueta: "No hubo comportamientos repetitivos ni estereotipados" },
    { valor: 1, etiqueta: "Un interés/comportamiento repetitivo hasta ser inusual" },
    { valor: 2, etiqueta: "Claramente repetitivos; minoría sustancial de sus intereses" },
    { valor: 3, etiqueta: "Constituyen la mayoría de sus intereses, o gran angustia" },
  ]},
  { id: "e1", seccion: "E. Otros comportamientos", texto: "E1. Elevado nivel de actividad", opciones: [
    { valor: 0, etiqueta: "Se sienta/queda quieto adecuadamente" },
    { valor: 1, etiqueta: "Se queda quieto cuando se espera, pero se mueve en otras" },
    { valor: 2, etiqueta: "Inquieto; más activo que otros de su nivel de desarrollo" },
    { valor: 3, etiqueta: "Se mueve sin parar y de manera enérgica" },
    { valor: 7, etiqueta: "Muy quieto, muy poca actividad" },
  ]},
  { id: "e2", seccion: "E. Otros comportamientos", texto: "E2. Lloriqueo e irritabilidad", opciones: [
    { valor: 0, etiqueta: "No muestra, o solo ocasional y leve (<3 seg)" },
    { valor: 1, etiqueta: "Irritabilidad leve ocasional (3-5 seg)" },
    { valor: 2, etiqueta: "Susceptibilidad o irritabilidad repetida" },
    { valor: 3, etiqueta: "Tiene berrinches con o sin agresión" },
  ]},
  { id: "e3", seccion: "E. Otros comportamientos", texto: "E3. Comportamiento agresivo o disruptivo", opciones: [
    { valor: 0, etiqueta: "No se muestra agresivo ni disruptivo intencionalmente" },
    { valor: 1, etiqueta: "Ocasionalmente, leve" },
    { valor: 2, etiqueta: "Leve mas de manera repetida" },
    { valor: 3, etiqueta: "Uno o varios comportamientos claros de intensidad significativa" },
  ]},
  { id: "e4", seccion: "E. Otros comportamientos", texto: "E4. Ansiedad", opciones: [
    { valor: 0, etiqueta: "No hay ansiedad evidente" },
    { valor: 1, etiqueta: "Signos leves, o leve y prolongada ante desconocidos" },
    { valor: 2, etiqueta: "Marcada solo ante petición/juguete concreto, o persistente" },
    { valor: 3, etiqueta: "Marcada en respuesta a más de un estímulo o en varias ocasiones" },
  ]},
];

const ADOS2_MODULO_T: TestDefinition = {
  id: "ados2_modulo_t",
  codigo: "ADOS2_T",
  nombre: "ADOS-2 · Módulo T (Preverbal/Palabras sueltas, 12-30 meses)",
  tipo: "observacion",
  categoria: "autismo",
  grupo: "ados2",
  nombreGrupo: "ADOS-2",
  nombreVariante: "Módulo T (12-30 meses)",
  descripcion:
    "Escala de Observación para el Diagnóstico del Autismo, 2ª edición (Lord et al.). Aplicación " +
    "exclusiva de evaluador certificado en ADOS-2, durante una sesión de observación estructurada.",
  instrucciones:
    "Codifique cada ítem según el comportamiento mostrado por el niño a lo largo de toda la " +
    "sesión de evaluación, inmediatamente después de terminarla.",
  algoritmoCalculo: "personalizado",
  requiereBaremo: false,
  dominios: [
    "A. Lenguaje y comunicación",
    "B. Interacción social recíproca",
    "C. Juego",
    "D. Comportamientos estereotipados e intereses restringidos",
    "E. Otros comportamientos",
  ],
  activo: true,
  preguntas: ADOS2T_ITEMS.map((item) => ({
    id: `ados2t_${item.id}`,
    texto: item.texto,
    tipo: "opcion_multiple" as const,
    dominio: item.seccion,
    opciones: item.opciones,
  })),
};

// ADOS-2 Módulo 2 ("Habla con frases"). Copyright © 2012 Western Psychological
// Services / edición española © 2015 TEA Ediciones. Contenido oficial provisto
// por el usuario, quien confirmó certificación y licencia para su uso. La
// tabla de clasificación (reverso de la hoja de algoritmo) no fue provista;
// por eso este módulo calcula únicamente las puntuaciones directas AS/CRR/
// Total, sin clasificación automática (ver lib/scoring/custom/ados2.ts).
const ADOS2_2_ITEMS: {
  id: string;
  seccion: string;
  texto: string;
  opciones: { valor: number; etiqueta: string }[];
}[] = [
  { id: "a1", seccion: "A. Lenguaje y comunicación", texto: "A1. Nivel general de lenguaje oral no ecolálico", opciones: [
    { valor: 0, etiqueta: "Habla con frases no ecolálicas de tres o más palabras" },
    { valor: 1, etiqueta: "Habla principalmente en verbalizaciones de dos o tres palabras" },
    { valor: 2, etiqueta: "Uso de frases ocasional; generalmente palabras sueltas" },
    { valor: 3, etiqueta: "Únicamente palabras sueltas; toda ecolálica; o no hay habla" },
  ]},
  { id: "a2", seccion: "A. Lenguaje y comunicación", texto: "A2. Anormalidades del habla asociadas al autismo (entonación/volumen/ritmo/velocidad)", opciones: [
    { valor: 0, etiqueta: "Entonación, volumen y velocidad normales" },
    { valor: 1, etiqueta: "Poca variación de timbre/tono; volumen levemente inusual" },
    { valor: 2, etiqueta: "Habla claramente anormal (lenta/rápida/rítmica irregular/plana)" },
    { valor: 7, etiqueta: "Tartamudeo u otro trastorno de la fluidez verbal" },
    { valor: 8, etiqueta: "Habla insuficiente para evaluar" },
  ]},
  { id: "a3", seccion: "A. Lenguaje y comunicación", texto: "A3. Ecolalia inmediata", opciones: [
    { valor: 0, etiqueta: "No repite el habla de otra persona" },
    { valor: 1, etiqueta: "Eco ocasional del lenguaje" },
    { valor: 2, etiqueta: "Repite con regularidad, pero también lenguaje espontáneo" },
    { valor: 3, etiqueta: "El habla consiste principalmente en ecolalia inmediata" },
  ]},
  { id: "a4", seccion: "A. Lenguaje y comunicación", texto: "A4. Uso estereotipado o idiosincrásico de palabras o frases", opciones: [
    { valor: 0, etiqueta: "Nunca o casi nunca usa palabras/frases estereotipadas" },
    { valor: 1, etiqueta: "Algo repetitivo/formal para su nivel, no claramente raro" },
    { valor: 2, etiqueta: "A menudo vocalizaciones estereotipadas o palabras raras" },
    { valor: 3, etiqueta: "Habla casi exclusivamente estereotipada o rara" },
  ]},
  { id: "a5", seccion: "A. Lenguaje y comunicación", texto: "A5. Conversación", opciones: [
    { valor: 0, etiqueta: "La conversación fluye, construyéndose sobre el diálogo" },
    { valor: 1, etiqueta: "Parte del habla incluye elaboración espontánea, con límites" },
    { valor: 2, etiqueta: "Poca conversación recíproca sostenida" },
    { valor: 3, etiqueta: "Escasa habla comunicativa espontánea" },
  ]},
  { id: "a6", seccion: "A. Lenguaje y comunicación", texto: "A6. Señalar", opciones: [
    { valor: 0, etiqueta: "Señala con dedo índice, mirada coordinada, a distancia" },
    { valor: 1, etiqueta: "Señala para referirse a objetos, sin flexibilidad de código 0" },
    { valor: 2, etiqueta: "Señala sin coordinar mirada/vocalización ni expresar interés" },
    { valor: 3, etiqueta: "No señala de ninguna manera" },
  ]},
  { id: "a7", seccion: "A. Lenguaje y comunicación", texto: "A7. Gestos descriptivos, convencionales, instrumentales o informativos", opciones: [
    { valor: 0, etiqueta: "Uso espontáneo de varios gestos descriptivos" },
    { valor: 1, etiqueta: "Algún uso espontáneo, pero exagerado o poco variado" },
    { valor: 2, etiqueta: "Solo gestos informativos/convencionales/instrumentales" },
    { valor: 3, etiqueta: "Ausencia o uso muy limitado de gestos" },
    { valor: 8, etiqueta: "N/A (p. ej., limitado por dificultad motora severa)" },
  ]},
  { id: "b1", seccion: "B. Interacción social recíproca", texto: "B1. Contacto visual inusual", opciones: [
    { valor: 0, etiqueta: "Mirada apropiada, con cambios sutiles" },
    { valor: 2, etiqueta: "Contacto visual modulado pobremente" },
  ]},
  { id: "b2", seccion: "B. Interacción social recíproca", texto: "B2. Expresiones faciales dirigidas a otros", opciones: [
    { valor: 0, etiqueta: "Dirige diversas expresiones faciales apropiadas" },
    { valor: 1, etiqueta: "Dirige algunas expresiones faciales" },
    { valor: 2, etiqueta: "No dirige expresiones faciales apropiadas a los demás" },
  ]},
  { id: "b3", seccion: "B. Interacción social recíproca", texto: "B3. Disfrute compartido durante la interacción", opciones: [
    { valor: 0, etiqueta: "Muestras claras de disfrute con el examinador, en +1 actividad" },
    { valor: 1, etiqueta: "Cierto disfrute adecuado, o claro en una sola interacción" },
    { valor: 2, etiqueta: "Escaso/nulo disfrute con el examinador, sí con familiar/objetos" },
    { valor: 3, etiqueta: "Poco o nulo disfrute durante la evaluación" },
  ]},
  { id: "b4", seccion: "B. Interacción social recíproca", texto: "B4. Respuesta al nombre", opciones: [
    { valor: 0, etiqueta: "Mira y establece contacto visual en 1 de los 2 primeros intentos" },
    { valor: 1, etiqueta: "Contacto visual tras 1º-2º intento (familiar) o 3º-4º (examinador)" },
    { valor: 2, etiqueta: "No hay contacto visual inmediato, pero cambia orientación/retraso" },
    { valor: 3, etiqueta: "No mira tras ningún intento puramente verbal" },
  ]},
  { id: "b5", seccion: "B. Interacción social recíproca", texto: "B5. Mostrar", opciones: [
    { valor: 0, etiqueta: "Muestra espontáneamente juguetes con contacto visual" },
    { valor: 1, etiqueta: "Muestra de manera parcial o inconsistente" },
    { valor: 2, etiqueta: "No muestra objetos a otras personas" },
  ]},
  { id: "b6", seccion: "B. Interacción social recíproca", texto: "B6. Iniciación espontánea de la atención conjunta", opciones: [
    { valor: 0, etiqueta: "Contacto visual integrado para dirigir atención a un objeto lejano" },
    { valor: 1, etiqueta: "Referencias parciales a un objeto fuera de alcance" },
    { valor: 2, etiqueta: "No hay aproximación a iniciación espontánea de atención conjunta" },
  ]},
  { id: "b7", seccion: "B. Interacción social recíproca", texto: "B7. Respuesta a la atención conjunta", opciones: [
    { valor: 0, etiqueta: "Sigue orientación de ojos/cara del examinador sin señalar" },
    { valor: 1, etiqueta: "Sigue la acción de señalar del examinador" },
    { valor: 2, etiqueta: "No sigue mirada/señalar, pero mira el objeto al activarse" },
    { valor: 3, etiqueta: "No se orienta hacia el objeto ni cuando se activa" },
  ]},
  { id: "b8", seccion: "B. Interacción social recíproca", texto: "B8. Características de las iniciaciones sociales", opciones: [
    { valor: 0, etiqueta: "Uso efectivo de formas verbales/no verbales, iniciaciones claras" },
    { valor: 1, etiqueta: "Iniciaciones con características ligeramente inusuales" },
    { valor: 2, etiqueta: "Minoría importante inapropiadas o carentes de naturaleza social" },
    { valor: 3, etiqueta: "No hay iniciaciones sociales de ningún tipo" },
  ]},
  { id: "b9a", seccion: "B. Interacción social recíproca", texto: "B9a. Cantidad de iniciaciones sociales / mantenimiento de la atención: Examinador", opciones: [
    { valor: 0, etiqueta: "Intentos frecuentes de captar/mantener/dirigir la atención" },
    { valor: 1, etiqueta: "Algunos intentos, con escasa frecuencia o en pocas actividades" },
    { valor: 2, etiqueta: "Intentos ocasionales, incluyendo solo buscar consuelo" },
    { valor: 3, etiqueta: "Relativamente poca preocupación por la atención del examinador" },
    { valor: 7, etiqueta: "Demandas de atención inusualmente frecuentes o excesivas" },
  ]},
  { id: "b9b", seccion: "B. Interacción social recíproca", texto: "B9b. Cantidad de iniciaciones sociales / mantenimiento de la atención: Familiar o cuidador", opciones: [
    { valor: 0, etiqueta: "Intentos frecuentes de captar/mantener/dirigir la atención" },
    { valor: 1, etiqueta: "Algunos intentos, con escasa frecuencia o en pocas actividades" },
    { valor: 2, etiqueta: "Intentos ocasionales, incluyendo solo buscar consuelo" },
    { valor: 3, etiqueta: "Relativamente poca preocupación por la atención del familiar" },
    { valor: 7, etiqueta: "Demandas de atención inusualmente frecuentes o excesivas" },
    { valor: 8, etiqueta: "El familiar o cuidador no estuvo presente" },
  ]},
  { id: "b10", seccion: "B. Interacción social recíproca", texto: "B10. Calidad de la respuesta social", opciones: [
    { valor: 0, etiqueta: "Gama adecuada de respuestas variadas según el contexto" },
    { valor: 1, etiqueta: "Reacciona a la mayoría, pero de forma limitada o inconsistente" },
    { valor: 2, etiqueta: "Respuestas extrañas, estereotipadas o poco variadas" },
    { valor: 3, etiqueta: "Respuesta mínima o inexistente a los intentos del examinador" },
  ]},
  { id: "b11", seccion: "B. Interacción social recíproca", texto: "B11. Cantidad de comunicación social recíproca", opciones: [
    { valor: 0, etiqueta: "Uso extenso de comportamientos verbales/no verbales recíprocos" },
    { valor: 1, etiqueta: "Alguna comunicación recíproca, reducida en frecuencia/cantidad" },
    { valor: 2, etiqueta: "Comunicación orientada a objetos/preguntas/ecolálica, poca reciprocidad" },
    { valor: 3, etiqueta: "Escasa o nula comunicación con examinador o familiar" },
  ]},
  { id: "b12", seccion: "B. Interacción social recíproca", texto: "B12. Calidad general de la relación", opciones: [
    { valor: 0, etiqueta: "Interacción agradable y apropiada" },
    { valor: 1, etiqueta: "Agradable a veces, no de forma sostenida" },
    { valor: 2, etiqueta: "Unilateral o inusual, sesión ligeramente incómoda" },
    { valor: 3, etiqueta: "Consideración mínima, sesión marcadamente incómoda" },
  ]},
  { id: "c1", seccion: "C. Juego", texto: "C1. Juego funcional con objetos", opciones: [
    { valor: 0, etiqueta: "Juega espontáneamente con diversos juguetes convencionalmente" },
    { valor: 1, etiqueta: "Algo de juego funcional espontáneo con al menos una miniatura" },
    { valor: 2, etiqueta: "Solo juguetes de causa-efecto/construcción, o empuja el coche" },
    { valor: 3, etiqueta: "No juega, o solo de manera estereotipada" },
  ]},
  { id: "c2", seccion: "C. Juego", texto: "C2. Imaginación y creatividad", opciones: [
    { valor: 0, etiqueta: "Variedad de juego creativo espontáneo, incluida la muñeca como agente" },
    { valor: 1, etiqueta: "Algo de juego creativo espontáneo o simbólico, poco variado" },
    { valor: 2, etiqueta: "Poco juego creativo, o solo repetitivo/estereotipado" },
    { valor: 3, etiqueta: "No hay juego creativo ni inventivo" },
  ]},
  { id: "d1", seccion: "D. Comportamientos estereotipados e intereses restringidos", texto: "D1. Interés sensorial inusual en materiales de juego o personas", opciones: [
    { valor: 0, etiqueta: "No presenta intereses sensoriales inusuales" },
    { valor: 1, etiqueta: "Varios posibles pero no tan claros como código 2" },
    { valor: 2, etiqueta: "Interés evidente por elementos sensoriales, o examen sensorial" },
    { valor: 3, etiqueta: "Comportamientos evidentes en ≥2 actividades, pueden interferir" },
  ]},
  { id: "d2", seccion: "D. Comportamientos estereotipados e intereses restringidos", texto: "D2. Manierismos de manos y dedos y otros manierismos complejos", opciones: [
    { valor: 0, etiqueta: "Ninguno" },
    { valor: 1, etiqueta: "Manierismos inusuales/repetitivos no tan claros como código 2" },
    { valor: 2, etiqueta: "Movimientos/retorcimientos evidentes, manierismos complejos" },
    { valor: 3, etiqueta: "Ocurren frecuentemente en ≥2 actividades, pueden interferir" },
  ]},
  { id: "d3", seccion: "D. Comportamientos estereotipados e intereses restringidos", texto: "D3. Conducta autolesiva", opciones: [
    { valor: 0, etiqueta: "No intenta autolesionarse" },
    { valor: 1, etiqueta: "Autolesión dudosa o posible, o infrecuente pero clara" },
    { valor: 2, etiqueta: "Más de un ejemplo claro de autolesión" },
  ]},
  { id: "d4", seccion: "D. Comportamientos estereotipados e intereses restringidos", texto: "D4. Intereses inusualmente repetitivos o comportamientos estereotipados", opciones: [
    { valor: 0, etiqueta: "No hubo comportamientos repetitivos ni estereotipados" },
    { valor: 1, etiqueta: "Un interés/comportamiento repetitivo hasta ser inusual" },
    { valor: 2, etiqueta: "Claramente repetitivos; minoría sustancial de sus intereses" },
    { valor: 3, etiqueta: "Constituyen la mayoría de sus intereses, o gran angustia" },
  ]},
  { id: "e1", seccion: "E. Otros comportamientos", texto: "E1. Elevado nivel de actividad", opciones: [
    { valor: 0, etiqueta: "Se sienta/queda quieto adecuadamente" },
    { valor: 1, etiqueta: "Quieto cuando se espera en algunas actividades, se mueve en otras" },
    { valor: 2, etiqueta: "Inquieto; más activo que otros de su nivel de desarrollo" },
    { valor: 3, etiqueta: "Se mueve sin parar y de manera enérgica, difícil de interrumpir" },
    { valor: 7, etiqueta: "Muy quieto, muy poca actividad" },
  ]},
  { id: "e2", seccion: "E. Otros comportamientos", texto: "E2. Berrinches, agresiones, comportamientos negativos o disruptivos", opciones: [
    { valor: 0, etiqueta: "No se muestra enfadado, disruptivo ni agresivo" },
    { valor: 1, etiqueta: "Ejemplo leve de enfado, agresividad o comportamiento disruptivo" },
    { valor: 2, etiqueta: "Más de un comportamiento disruptivo o moderadamente agresivo" },
    { valor: 3, etiqueta: "Negativismo marcado o repetitivo, berrinches o agresiones importantes" },
  ]},
  { id: "e3", seccion: "E. Otros comportamientos", texto: "E3. Ansiedad", opciones: [
    { valor: 0, etiqueta: "No hay ansiedad evidente" },
    { valor: 1, etiqueta: "Signos leves, o marcada solo ante petición/juguete concreto" },
    { valor: 2, etiqueta: "Marcada en respuesta a más de un estímulo o en varias ocasiones" },
  ]},
];

const ADOS2_MODULO_2: TestDefinition = {
  id: "ados2_modulo_2",
  codigo: "ADOS2_2",
  nombre: "ADOS-2 · Módulo 2 (Habla con frases)",
  tipo: "observacion",
  categoria: "autismo",
  grupo: "ados2",
  nombreGrupo: "ADOS-2",
  nombreVariante: "Módulo 2 (habla con frases)",
  descripcion:
    "Escala de Observación para el Diagnóstico del Autismo, 2ª edición (Lord et al.). Aplicación " +
    "exclusiva de evaluador certificado en ADOS-2, durante una sesión de observación estructurada. " +
    "Nota: la clasificación automática (Autismo/Espectro del autismo/No espectro) aún no está " +
    "disponible para este módulo — falta incorporar la tabla oficial de corte por edad; el reporte " +
    "muestra únicamente las puntuaciones directas AS/CRR/Total.",
  instrucciones:
    "Codifique cada ítem según el comportamiento mostrado por el niño a lo largo de toda la " +
    "sesión de evaluación, inmediatamente después de terminarla.",
  algoritmoCalculo: "personalizado",
  requiereBaremo: false,
  dominios: [
    "A. Lenguaje y comunicación",
    "B. Interacción social recíproca",
    "C. Juego",
    "D. Comportamientos estereotipados e intereses restringidos",
    "E. Otros comportamientos",
  ],
  activo: true,
  preguntas: ADOS2_2_ITEMS.map((item) => ({
    id: `ados22_${item.id}`,
    texto: item.texto,
    tipo: "opcion_multiple" as const,
    dominio: item.seccion,
    opciones: item.opciones,
  })),
};

// ADOS-2 Módulo 3 (Fluidez verbal — niños y adolescentes). Copyright © 2012
// Western Psychological Services / edición española © 2015 TEA Ediciones.
// Contenido oficial provisto por el usuario, quien confirmó certificación y
// licencia para su uso. A diferencia del Módulo 2, este cuadernillo sí
// incluye la tabla de clasificación (reverso de la hoja de algoritmo), por
// lo que este módulo calcula clasificación y nivel de riesgo automáticos.
const ADOS2_3_ITEMS: {
  id: string;
  seccion: string;
  texto: string;
  opciones: { valor: number; etiqueta: string }[];
}[] = [
  { id: "a1", seccion: "A. Lenguaje y comunicación", texto: "A1. Nivel general de lenguaje oral no ecolálico", opciones: [
    { valor: 0, etiqueta: "Utiliza frases de manera generalmente correcta (con complejas)" },
    { valor: 1, etiqueta: "Algo de habla relativamente compleja, con errores gramaticales recurrentes" },
    { valor: 2, etiqueta: "Habla no ecolálica de al menos tres palabras, sin lenguaje complejo" },
    { valor: 3, etiqueta: "El habla no ecolálica consiste principalmente en frases simples" },
  ]},
  { id: "a2", seccion: "A. Lenguaje y comunicación", texto: "A2. Anormalidades del habla asociadas al autismo (entonación/volumen/ritmo/velocidad)", opciones: [
    { valor: 0, etiqueta: "Entonación, volumen y velocidad normales" },
    { valor: 1, etiqueta: "Poca variación de timbre/tono; volumen levemente inusual" },
    { valor: 2, etiqueta: "Habla claramente anormal (lenta/rápida/rítmica irregular/plana)" },
    { valor: 7, etiqueta: "Tartamudeo u otro trastorno de la fluidez verbal" },
  ]},
  { id: "a3", seccion: "A. Lenguaje y comunicación", texto: "A3. Ecolalia inmediata", opciones: [
    { valor: 0, etiqueta: "No repite el habla de otra persona" },
    { valor: 1, etiqueta: "Eco ocasional del lenguaje" },
    { valor: 2, etiqueta: "Repite con regularidad, pero también lenguaje espontáneo" },
    { valor: 3, etiqueta: "El habla consiste principalmente en ecolalia inmediata" },
  ]},
  { id: "a4", seccion: "A. Lenguaje y comunicación", texto: "A4. Uso estereotipado o idiosincrásico de palabras o frases", opciones: [
    { valor: 0, etiqueta: "Nunca o casi nunca usa palabras/frases estereotipadas" },
    { valor: 1, etiqueta: "Algo repetitivo/formal para su nivel, no claramente raro" },
    { valor: 2, etiqueta: "A menudo vocalizaciones estereotipadas o palabras raras" },
    { valor: 3, etiqueta: "Habla frecuentemente rara o estereotipada" },
  ]},
  { id: "a5", seccion: "A. Lenguaje y comunicación", texto: "A5. Ofrece información", opciones: [
    { valor: 0, etiqueta: "Ofrece información espontáneamente en varias ocasiones" },
    { valor: 1, etiqueta: "A veces ofrece información de manera espontánea" },
    { valor: 2, etiqueta: "Nunca o casi nunca ofrece información de forma espontánea" },
  ]},
  { id: "a6", seccion: "A. Lenguaje y comunicación", texto: "A6. Pide información", opciones: [
    { valor: 0, etiqueta: "Le pregunta al examinador sobre pensamientos/experiencias en varias ocasiones" },
    { valor: 1, etiqueta: "Ocasionalmente (un ejemplo claro) le pregunta al examinador" },
    { valor: 2, etiqueta: "Responde adecuadamente, pero no pregunta de manera espontánea" },
    { valor: 3, etiqueta: "Rara vez o nunca expresa interés por preguntar al examinador" },
  ]},
  { id: "a7", seccion: "A. Lenguaje y comunicación", texto: "A7. Narración de sucesos", opciones: [
    { valor: 0, etiqueta: "Informa sobre un hecho no rutinario específico, sin preguntas específicas" },
    { valor: 1, etiqueta: "Da información suficiente de un hecho rutinario" },
    { valor: 2, etiqueta: "Depende de preguntas específicas del examinador para continuar" },
    { valor: 3, etiqueta: "Respuestas inconsistentes o insuficientes, incluso con preguntas específicas" },
  ]},
  { id: "a8", seccion: "A. Lenguaje y comunicación", texto: "A8. Conversación", opciones: [
    { valor: 0, etiqueta: "La conversación fluye, construyéndose sobre el diálogo del examinador" },
    { valor: 1, etiqueta: "Parte del habla incluye elaboración espontánea, con límites" },
    { valor: 2, etiqueta: "Poca conversación recíproca sostenida" },
    { valor: 3, etiqueta: "Poca habla comunicativa espontánea" },
  ]},
  { id: "a9", seccion: "A. Lenguaje y comunicación", texto: "A9. Gestos descriptivos, convencionales, instrumentales o informativos", opciones: [
    { valor: 0, etiqueta: "Uso espontáneo de varios gestos descriptivos" },
    { valor: 1, etiqueta: "Algún uso espontáneo, pero exagerado o poco variado" },
    { valor: 2, etiqueta: "Solo gestos informativos/convencionales/instrumentales" },
    { valor: 3, etiqueta: "Ausencia o uso muy limitado de gestos" },
    { valor: 8, etiqueta: "N/A (p. ej., limitado por dificultad motora severa)" },
  ]},
  { id: "b1", seccion: "B. Interacción social recíproca", texto: "B1. Contacto visual inusual", opciones: [
    { valor: 0, etiqueta: "Mirada apropiada, con cambios sutiles" },
    { valor: 2, etiqueta: "Contacto visual modulado pobremente" },
  ]},
  { id: "b2", seccion: "B. Interacción social recíproca", texto: "B2. Expresiones faciales dirigidas al examinador", opciones: [
    { valor: 0, etiqueta: "Dirige diversas expresiones faciales apropiadas al examinador" },
    { valor: 1, etiqueta: "Dirige algunas expresiones faciales al examinador" },
    { valor: 2, etiqueta: "No dirige expresiones faciales apropiadas al examinador" },
  ]},
  { id: "b3", seccion: "B. Interacción social recíproca", texto: "B3. Producción de lenguaje y comunicación no verbal asociada", opciones: [
    { valor: 0, etiqueta: "Vocalización con cambios sutiles y adecuados en gestos/miradas/expresiones" },
    { valor: 1, etiqueta: "Vocalización con variedad/frecuencia anormal, limitada o inferior" },
    { valor: 2, etiqueta: "Escasa o nula comunicación no verbal combinada con vocalizaciones" },
    { valor: 7, etiqueta: "Cierta evitación de la mirada, pero con modulación/coordinación" },
    { valor: 8, etiqueta: "N/A; no hay vocalizaciones, o comunicación no verbal mínima" },
  ]},
  { id: "b4", seccion: "B. Interacción social recíproca", texto: "B4. Disfrute compartido durante la interacción", opciones: [
    { valor: 0, etiqueta: "Muestras claras de disfrute adecuadas, en +1 actividad" },
    { valor: 1, etiqueta: "Cierto disfrute adecuado, o claro en una sola interacción" },
    { valor: 2, etiqueta: "Escaso/nulo disfrute con el examinador, sí en discurso/acciones propias" },
    { valor: 3, etiqueta: "Poco o nulo disfrute durante la evaluación" },
  ]},
  { id: "b5", seccion: "B. Interacción social recíproca", texto: "B5. Comentarios sobre las emociones de otros / empatía", opciones: [
    { valor: 0, etiqueta: "Transmite espontáneamente clara comprensión de varias emociones" },
    { valor: 1, etiqueta: "Cierta comprensión/identificación de una emoción de otros" },
    { valor: 2, etiqueta: "Escasa o nula identificación de estados emocionales de otros" },
  ]},
  { id: "b6", seccion: "B. Interacción social recíproca", texto: "B6. Comprensión de las situaciones y relaciones sociales típicas", opciones: [
    { valor: 0, etiqueta: "Muestra ejemplos de comprensión de varias relaciones y de su propio papel" },
    { valor: 1, etiqueta: "Comprende varias relaciones, pero no su propio papel (o solo una)" },
    { valor: 2, etiqueta: "Cierta comprensión de una sola relación social típica" },
    { valor: 3, etiqueta: "Comprensión escasa o nula de las relaciones sociales típicas" },
  ]},
  { id: "b7", seccion: "B. Interacción social recíproca", texto: "B7. Características de las iniciaciones sociales", opciones: [
    { valor: 0, etiqueta: "Uso efectivo de formas verbales/no verbales, iniciaciones claras" },
    { valor: 1, etiqueta: "Iniciaciones con características ligeramente inusuales" },
    { valor: 2, etiqueta: "Iniciaciones inapropiadas; muchas carecen de integración/naturaleza social" },
    { valor: 3, etiqueta: "No hay iniciaciones sociales de ningún tipo" },
  ]},
  { id: "b8", seccion: "B. Interacción social recíproca", texto: "B8. Cantidad de iniciaciones sociales / mantenimiento de la atención", opciones: [
    { valor: 0, etiqueta: "Intentos frecuentes de captar/mantener/dirigir la atención" },
    { valor: 1, etiqueta: "Algunos intentos, con escasa frecuencia o en pocas actividades" },
    { valor: 2, etiqueta: "Intentos ocasionales, relacionados únicamente con preocupaciones" },
    { valor: 3, etiqueta: "Relativamente poca preocupación por la atención del examinador" },
    { valor: 7, etiqueta: "Demandas de atención inusualmente frecuentes o excesivas" },
  ]},
  { id: "b9", seccion: "B. Interacción social recíproca", texto: "B9. Calidad de la respuesta social", opciones: [
    { valor: 0, etiqueta: "Gama adecuada de respuestas variadas según el contexto" },
    { valor: 1, etiqueta: "Reacciona a la mayoría, pero de forma limitada o inconsistente" },
    { valor: 2, etiqueta: "Respuestas extrañas, estereotipadas o poco variadas" },
    { valor: 3, etiqueta: "Respuesta mínima o inexistente a los intentos del examinador" },
  ]},
  { id: "b10", seccion: "B. Interacción social recíproca", texto: "B10. Cantidad de comunicación social recíproca", opciones: [
    { valor: 0, etiqueta: "Uso extenso de comportamientos verbales/no verbales recíprocos" },
    { valor: 1, etiqueta: "Alguna comunicación recíproca, reducida en frecuencia/cantidad" },
    { valor: 2, etiqueta: "Comunicación orientada a objetos/preguntas/ecolálica, poca reciprocidad" },
    { valor: 3, etiqueta: "Escasa o nula comunicación con el examinador" },
  ]},
  { id: "b11", seccion: "B. Interacción social recíproca", texto: "B11. Calidad general de la relación", opciones: [
    { valor: 0, etiqueta: "Interacción agradable y apropiada" },
    { valor: 1, etiqueta: "Agradable a veces, no de forma sostenida" },
    { valor: 2, etiqueta: "Unilateral o inusual, sesión ligeramente incómoda" },
    { valor: 3, etiqueta: "Consideración mínima, sesión marcadamente incómoda" },
  ]},
  { id: "c1", seccion: "C. Imaginación", texto: "C1. Imaginación y creatividad", opciones: [
    { valor: 0, etiqueta: "Introduce diversas actividades o comentarios creativos, originales" },
    { valor: 1, etiqueta: "Algunas acciones imaginativas, poco variadas o solo en situación estructurada" },
    { valor: 2, etiqueta: "Escasas acciones imaginativas, o solo repetitivas/estereotipadas" },
    { valor: 3, etiqueta: "No hay acciones creativas ni inventivas" },
  ]},
  { id: "d1", seccion: "D. Comportamientos estereotipados e intereses restringidos", texto: "D1. Interés sensorial inusual en los materiales de juego o en las personas", opciones: [
    { valor: 0, etiqueta: "No presenta intereses sensoriales inusuales" },
    { valor: 1, etiqueta: "Varios posibles pero no tan claros como código 2" },
    { valor: 2, etiqueta: "Interés evidente por elementos sensoriales, o examen sensorial" },
    { valor: 3, etiqueta: "Comportamientos evidentes en ≥2 actividades, pueden interferir" },
  ]},
  { id: "d2", seccion: "D. Comportamientos estereotipados e intereses restringidos", texto: "D2. Manierismos de manos y dedos y otros manierismos complejos", opciones: [
    { valor: 0, etiqueta: "Ninguno" },
    { valor: 1, etiqueta: "Manierismos inusuales/repetitivos no tan claros como código 2" },
    { valor: 2, etiqueta: "Movimientos/retorcimientos evidentes, manierismos complejos" },
    { valor: 3, etiqueta: "Ocurren frecuentemente en ≥2 actividades, pueden interferir" },
  ]},
  { id: "d3", seccion: "D. Comportamientos estereotipados e intereses restringidos", texto: "D3. Conducta autolesiva", opciones: [
    { valor: 0, etiqueta: "No intenta autolesionarse" },
    { valor: 1, etiqueta: "Autolesión dudosa o posible, o infrecuente pero clara" },
    { valor: 2, etiqueta: "Más de un ejemplo claro de autolesión" },
  ]},
  { id: "d4", seccion: "D. Comportamientos estereotipados e intereses restringidos", texto: "D4. Interés excesivo o referencias a temas u objetos inusuales o altamente específicos o comportamientos repetitivos", opciones: [
    { valor: 0, etiqueta: "No hubo interés excesivo, referencias inusuales ni conductas repetitivas" },
    { valor: 1, etiqueta: "Referencias ocasionales a temas/patrones de interés inusuales" },
    { valor: 2, etiqueta: "Patrones de interés evidentes, estereotipados o inusuales" },
    { valor: 3, etiqueta: "Preocupaciones o comportamientos repetitivos evidentes que interfieren" },
  ]},
  { id: "d5", seccion: "D. Comportamientos estereotipados e intereses restringidos", texto: "D5. Compulsiones o rituales", opciones: [
    { valor: 0, etiqueta: "No hubo actividades o rutinas verbales claras a completar" },
    { valor: 1, etiqueta: "Actividades o lenguaje inusualmente fijados a una rutina, sin compulsión clara" },
    { valor: 2, etiqueta: "Una o más rutinas verbales que debe completar de manera específica (compulsivo)" },
  ]},
  { id: "e1", seccion: "E. Otros comportamientos", texto: "E1. Elevado nivel de actividad / agitación", opciones: [
    { valor: 0, etiqueta: "Se sienta quieto de manera apropiada" },
    { valor: 1, etiqueta: "Inquieto o se mueve constantemente en la silla" },
    { valor: 2, etiqueta: "Dificultades para quedarse sentado; manipula objetos de forma disruptiva" },
    { valor: 3, etiqueta: "Comportamientos hiperactivos difíciles de interrumpir; interfiere con la evaluación" },
    { valor: 7, etiqueta: "Muy quieto, muy poca actividad" },
  ]},
  { id: "e2", seccion: "E. Otros comportamientos", texto: "E2. Berrinches, agresiones, comportamientos negativos o disruptivos", opciones: [
    { valor: 0, etiqueta: "No se muestra enfadado, disruptivo ni agresivo" },
    { valor: 1, etiqueta: "Ejemplo leve de disrupción, enfado o comportamiento agresivo/negativo" },
    { valor: 2, etiqueta: "Más de un comportamiento intencionadamente disruptivo o negativo" },
    { valor: 3, etiqueta: "Berrinches marcados o repetitivos, o agresión significativa" },
  ]},
  { id: "e3", seccion: "E. Otros comportamientos", texto: "E3. Ansiedad", opciones: [
    { valor: 0, etiqueta: "No hay ansiedad evidente" },
    { valor: 1, etiqueta: "Signos leves de ansiedad o inseguridad, especialmente al principio" },
    { valor: 2, etiqueta: "Ansiedad marcada a lo largo de la evaluación" },
  ]},
];

const ADOS2_MODULO_3: TestDefinition = {
  id: "ados2_modulo_3",
  codigo: "ADOS2_3",
  nombre: "ADOS-2 · Módulo 3 (Fluidez verbal, niños y adolescentes)",
  tipo: "observacion",
  categoria: "autismo",
  grupo: "ados2",
  nombreGrupo: "ADOS-2",
  nombreVariante: "Módulo 3 (fluidez verbal)",
  descripcion:
    "Escala de Observación para el Diagnóstico del Autismo, 2ª edición (Lord et al.). Aplicación " +
    "exclusiva de evaluador certificado en ADOS-2, durante una sesión de observación estructurada.",
  instrucciones:
    "Codifique cada ítem según el comportamiento mostrado por el evaluado a lo largo de toda la " +
    "sesión de evaluación, inmediatamente después de terminarla.",
  algoritmoCalculo: "personalizado",
  requiereBaremo: false,
  dominios: [
    "A. Lenguaje y comunicación",
    "B. Interacción social recíproca",
    "C. Imaginación",
    "D. Comportamientos estereotipados e intereses restringidos",
    "E. Otros comportamientos",
  ],
  activo: true,
  preguntas: ADOS2_3_ITEMS.map((item) => ({
    id: `ados23_${item.id}`,
    texto: item.texto,
    tipo: "opcion_multiple" as const,
    dominio: item.seccion,
    opciones: item.opciones,
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
  PERFIL_SENSORIAL_BREVE,
  PERFIL_SENSORIAL_ESCOLAR,
  PERFIL_SENSORIAL_NINO,
  ADOS2_MODULO_T,
  ADOS2_MODULO_2,
  ADOS2_MODULO_3,
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
