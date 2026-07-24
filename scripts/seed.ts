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

const ABC: TestDefinition = {
  id: "abc",
  codigo: "ABC",
  nombre: "ABC (Escala de Comportamiento Aberrante)",
  tipo: "autoinforme",
  descripcion: "Escala de comportamiento aberrante, respondida por cuidador/evaluador.",
  instrucciones: "Califique la frecuencia/intensidad de cada conducta observada.",
  algoritmoCalculo: "suma_por_dominio",
  requiereBaremo: true,
  dominios: ["irritabilidad", "letargo", "conducta_estereotipada", "hiperactividad", "habla_inapropiada"],
  activo: true,
  preguntas: Array.from({ length: 10 }, (_, i) => ({
    id: `abc_${i + 1}`,
    texto: `[Reactivo ABC #${i + 1} — conducta observada]`,
    tipo: "likert" as const,
    dominio: ["irritabilidad", "letargo", "conducta_estereotipada", "hiperactividad", "habla_inapropiada"][
      i % 5
    ],
    opciones: [
      { valor: 0, etiqueta: "No es un problema" },
      { valor: 1, etiqueta: "Problema leve" },
      { valor: 2, etiqueta: "Problema moderado" },
      { valor: 3, etiqueta: "Problema severo" },
    ],
  })),
};

const ADOS2: TestDefinition = {
  id: "ados2",
  codigo: "ADOS2",
  nombre: "ADOS-2 (Observación Diagnóstica)",
  tipo: "observacion",
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
