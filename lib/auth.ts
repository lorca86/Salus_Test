import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { UserProfile } from "@/lib/types";

export function observarSesion(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function iniciarSesion(email: string, password: string) {
  const credencial = await signInWithEmailAndPassword(auth, email, password);
  return credencial.user;
}

export async function cerrarSesion() {
  await firebaseSignOut(auth);
}

export async function obtenerPerfil(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function crearOActualizarPerfil(perfil: UserProfile): Promise<void> {
  await setDoc(doc(db, "users", perfil.uid), perfil, { merge: true });
}
