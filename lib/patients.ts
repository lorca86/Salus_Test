import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Patient } from "@/lib/types";

export async function crearPaciente(
  datos: Omit<Patient, "id" | "fechaRegistro">
): Promise<Patient> {
  const nuevo = { ...datos, fechaRegistro: new Date().toISOString() };
  const ref = await addDoc(collection(db, "patients"), nuevo);
  return { id: ref.id, ...nuevo };
}

export async function listarPacientes(evaluadorId: string): Promise<Patient[]> {
  const q = query(
    collection(db, "patients"),
    where("evaluadorId", "==", evaluadorId),
    orderBy("fechaRegistro", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Patient, "id">) }));
}

export async function obtenerPaciente(id: string): Promise<Patient | null> {
  const snap = await getDoc(doc(db, "patients", id));
  return snap.exists() ? { id: snap.id, ...(snap.data() as Omit<Patient, "id">) } : null;
}

// Borra el expediente y, en cascada, todas sus evaluaciones y resultados
// asociados (de lo contrario quedarían huérfanos referenciando un
// patientId que ya no existe).
export async function eliminarPaciente(id: string): Promise<void> {
  const [assessmentsSnap, resultadosSnap] = await Promise.all([
    getDocs(query(collection(db, "assessments"), where("patientId", "==", id))),
    getDocs(query(collection(db, "results"), where("patientId", "==", id))),
  ]);
  await Promise.all([
    ...assessmentsSnap.docs.map((d) => deleteDoc(d.ref)),
    ...resultadosSnap.docs.map((d) => deleteDoc(d.ref)),
  ]);
  await deleteDoc(doc(db, "patients", id));
}
