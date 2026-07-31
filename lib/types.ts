// Modelos de datos de Firestore para SALUS Psicométrico.
// Todas las colecciones viven en Firestore; no se persiste nada relevante en local
// salvo el estado transitorio de "kiosco bloqueado" (ver lib/kiosk.ts).

export type Rol = "evaluador" | "admin";

export interface UserProfile {
  uid: string;
  email: string;
  nombre: string;
  rol: Rol;
  pinSeguridad: string; // hash SHA-256 "salt:pin" (ver lib/pin.ts), nunca el PIN en claro
  pinSalt: string;
  creadoEn: string; // ISO date
}

export type Sexo = "masculino" | "femenino" | "otro";

export interface Patient {
  id: string;
  evaluadorId: string;
  nombreCompleto: string;
  edad: number;
  sexo: Sexo;
  fechaNacimiento: string; // ISO date
  notas?: string;
  fechaRegistro: string; // ISO date
}

export type TipoTest = "autoinforme" | "observacion";

export type TipoPregunta =
  | "likert"
  | "opcion_multiple"
  | "eleccion_forzada"
  | "si_no";

export interface OpcionPregunta {
  valor: number | string;
  etiqueta: string;
}

export interface Pregunta {
  id: string;
  texto: string;
  tipo: TipoPregunta;
  opciones: OpcionPregunta[];
  dominio?: string; // p.ej. sub-escala a la que pertenece (para tests multidominio)
  // Algunos instrumentos agrupan cada ítem en más de una clasificación a la
  // vez (p.ej. Perfil Sensorial-2: cada ítem cuenta simultáneamente para un
  // Cuadrante, una Sección sensorial y un Factor escolar). `dominio` sigue
  // siendo el eje principal; estos son ejes adicionales: eje -> valor.
  ejesAdicionales?: Record<string, string>;
  reverso?: boolean; // si la puntuación se invierte al calcular
}

export type AlgoritmoCalculo =
  | "suma_directa"
  | "suma_por_dominio"
  | "conteo_categoria"
  | "personalizado";

export type CategoriaTest = "psicologia" | "autismo" | "laboral" | "pedagogia";

export interface TestDefinition {
  id: string;
  codigo: string; // PHQ9, GAD7, VARK, ZAVIC, CLEAVER, MCHAT, ABC, ADOS2...
  nombre: string;
  tipo: TipoTest;
  categoria: CategoriaTest;
  // Agrupa variantes del mismo instrumento (p.ej. Perfil Sensorial-2: Breve
  // y Escolar) bajo una sola tarjeta en el catálogo con selector de versión.
  grupo?: string;
  nombreGrupo?: string; // etiqueta del grupo, p.ej. "Perfil Sensorial 2"
  nombreVariante?: string; // etiqueta corta de esta variante, p.ej. "Breve (SSP)"
  descripcion?: string;
  instrucciones: string;
  tiempoLimiteMin?: number;
  preguntas: Pregunta[];
  algoritmoCalculo: AlgoritmoCalculo;
  dominios?: string[]; // nombres de sub-escalas si aplica
  requiereBaremo: boolean; // si cruza con normative_tables
  activo: boolean;
}

// Baremos: tabla de conversión de puntuación directa -> percentil/escalar,
// segmentada por rango de edad y sexo.
export interface NormativeTable {
  id: string;
  testId: string;
  edadMin: number;
  edadMax: number;
  sexo: Sexo | "ambos";
  dominio?: string;
  tablaConversion: Record<string, number>; // puntuacionDirecta (string) -> percentil/escalar
}

export type ModalidadAplicacion = "remoto" | "tablet" | "presencial";
export type EstadoAssessment = "pendiente" | "en_proceso" | "completado";

export interface Assessment {
  id: string;
  testId: string;
  patientId: string;
  evaluadorId: string;
  tokenAcceso: string; // token único para acceso remoto sin login
  tokenExpiraEn?: string; // ISO date
  modalidad: ModalidadAplicacion;
  estado: EstadoAssessment;
  // Edad y sexo del paciente AL MOMENTO DE ASIGNAR, copiados aquí a propósito:
  // el modo remoto (sin sesión) y el kiosco necesitan estos datos para
  // baremar, pero no deben tener acceso de lectura al expediente completo
  // (nombre, notas) de la colección `patients`.
  pacienteEdad: number;
  pacienteSexo: Sexo;
  respuestas: Record<string, number | string>; // preguntaId -> valor (guardado incremental)
  iniciadoEn?: string;
  completadoEn?: string;
  creadoEn: string;
}

export type NivelRiesgo = "minimo" | "leve" | "moderado" | "severo" | "pendiente";

export interface Result {
  id: string;
  assessmentId: string;
  patientId: string;
  testId: string;
  puntuacionesDirectas: Record<string, number>; // por dominio o "total"
  puntuacionesConvertidas: Record<string, number>;
  percentiles: Record<string, number>;
  // Clasificación por bandas (p.ej. Perfil Sensorial-2: "Más que los demás",
  // "Como los demás"...), independiente del cruce edad/sexo de `percentiles`.
  clasificaciones?: Record<string, string>;
  nivelRiesgo: NivelRiesgo;
  resumenTexto: string;
  fechaCalculo: string;
}
