import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { TestDefinition } from "@/lib/types";

export async function listarCatalogo(soloAutoinforme = false): Promise<TestDefinition[]> {
  const q = soloAutoinforme
    ? query(collection(db, "tests"), where("tipo", "==", "autoinforme"), where("activo", "==", true))
    : query(collection(db, "tests"), where("activo", "==", true));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as TestDefinition);
}

export async function obtenerTest(testId: string): Promise<TestDefinition | null> {
  const snap = await getDoc(doc(db, "tests", testId));
  return snap.exists() ? (snap.data() as TestDefinition) : null;
}
