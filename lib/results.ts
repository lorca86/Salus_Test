import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Result } from "@/lib/types";

export async function obtenerResultadoPorAssessment(assessmentId: string): Promise<Result | null> {
  const snap = await getDocs(query(collection(db, "results"), where("assessmentId", "==", assessmentId)));
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...(d.data() as Omit<Result, "id">) };
}

export async function listarResultadosPorPaciente(patientId: string): Promise<Result[]> {
  const snap = await getDocs(query(collection(db, "results"), where("patientId", "==", patientId)));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Result, "id">) }));
}
