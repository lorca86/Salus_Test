import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { generarTokenAcceso } from "@/lib/tokens";
import { calcularResultado } from "@/lib/scoring/engine";
import type {
  Assessment,
  ModalidadAplicacion,
  NormativeTable,
  Patient,
  Result,
  TestDefinition,
} from "@/lib/types";

export async function crearAsignacion(params: {
  testId: string;
  patientId: string;
  evaluadorId: string;
  modalidad: ModalidadAplicacion;
  paciente: Pick<Patient, "edad" | "sexo">;
}): Promise<Assessment> {
  const token = generarTokenAcceso();
  // El token es también el ID del documento: así el enlace remoto (o la
  // tablet) solo necesita conocer este identificador impredecible para
  // leer/actualizar ÚNICAMENTE este assessment (ver firestore.rules).
  const ref = doc(db, "assessments", token);
  const nuevo: Assessment = {
    id: token,
    testId: params.testId,
    patientId: params.patientId,
    evaluadorId: params.evaluadorId,
    tokenAcceso: token,
    modalidad: params.modalidad,
    estado: "pendiente",
    respuestas: {},
    pacienteEdad: params.paciente.edad,
    pacienteSexo: params.paciente.sexo,
    creadoEn: new Date().toISOString(),
  };
  await setDoc(ref, nuevo);
  return nuevo;
}

export async function obtenerAsignacion(id: string): Promise<Assessment | null> {
  const snap = await getDoc(doc(db, "assessments", id));
  return snap.exists() ? (snap.data() as Assessment) : null;
}

// Guardado incremental: se llama en cada respuesta para no perder progreso
// si la tablet pierde conexión (Firestore encola la escritura offline).
export async function guardarRespuesta(
  assessmentId: string,
  preguntaId: string,
  valor: number | string,
  estadoActual: Assessment["estado"]
): Promise<void> {
  const ref = doc(db, "assessments", assessmentId);
  await updateDoc(ref, {
    [`respuestas.${preguntaId}`]: valor,
    estado: estadoActual === "pendiente" ? "en_proceso" : estadoActual,
    ...(estadoActual === "pendiente" ? { iniciadoEn: new Date().toISOString() } : {}),
  });
}

export async function finalizarAsignacion(
  assessment: Assessment,
  test: TestDefinition
): Promise<void> {
  const tablasSnap = await getDocs(
    query(collection(db, "normative_tables"), where("testId", "==", test.id))
  );
  const tablas = tablasSnap.docs.map((d) => d.data() as NormativeTable);

  const paciente = { edad: assessment.pacienteEdad, sexo: assessment.pacienteSexo };
  const resultado = calcularResultado(assessment, test, paciente, tablas);

  await addDoc(collection(db, "results"), resultado);
  await updateDoc(doc(db, "assessments", assessment.id), {
    estado: "completado",
    completadoEn: new Date().toISOString(),
  });
}

// Aplicación en vivo: el evaluador corre la prueba dentro de su propio panel
// (no un enlace remoto ni la tablet) y guarda assessment + resultado en un
// solo paso, ya con todas las respuestas contestadas.
export async function crearYFinalizarAplicacionDirecta(params: {
  testId: string;
  patientId: string;
  evaluadorId: string;
  respuestas: Record<string, number | string>;
  paciente: Pick<Patient, "edad" | "sexo">;
  test: TestDefinition;
}): Promise<{ assessment: Assessment; resultado: Result }> {
  const token = generarTokenAcceso();
  const ahora = new Date().toISOString();
  const assessment: Assessment = {
    id: token,
    testId: params.testId,
    patientId: params.patientId,
    evaluadorId: params.evaluadorId,
    tokenAcceso: token,
    modalidad: "presencial",
    estado: "completado",
    respuestas: params.respuestas,
    pacienteEdad: params.paciente.edad,
    pacienteSexo: params.paciente.sexo,
    iniciadoEn: ahora,
    completadoEn: ahora,
    creadoEn: ahora,
  };
  await setDoc(doc(db, "assessments", token), assessment);

  const tablasSnap = await getDocs(
    query(collection(db, "normative_tables"), where("testId", "==", params.testId))
  );
  const tablas = tablasSnap.docs.map((d) => d.data() as NormativeTable);
  const resultadoData = calcularResultado(assessment, params.test, params.paciente, tablas);
  const resultRef = await addDoc(collection(db, "results"), resultadoData);

  return { assessment, resultado: { id: resultRef.id, ...resultadoData } };
}
