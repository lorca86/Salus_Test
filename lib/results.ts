import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Result } from "@/lib/types";

export async function obtenerResultadoPorAssessment(assessmentId: string): Promise<Result | null> {
  const snap = await getDocs(query(collection(db, "results"), where("assessmentId", "==", assessmentId)));
  if (snap.empty) return null;
  return snap.docs[0].data() as Result;
}

export async function listarResultadosPorPaciente(patientId: string): Promise<Result[]> {
  const snap = await getDocs(query(collection(db, "results"), where("patientId", "==", patientId)));
  return snap.docs.map((d) => d.data() as Result);
}
