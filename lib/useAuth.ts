"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { observarSesion, obtenerPerfil } from "@/lib/auth";
import type { UserProfile } from "@/lib/types";

interface EstadoAuth {
  usuario: User | null;
  perfil: UserProfile | null;
  cargando: boolean;
}

export function useAuth(): EstadoAuth {
  const [estado, setEstado] = useState<EstadoAuth>({
    usuario: null,
    perfil: null,
    cargando: true,
  });

  useEffect(() => {
    const unsubscribe = observarSesion(async (user) => {
      if (!user) {
        setEstado({ usuario: null, perfil: null, cargando: false });
        return;
      }
      const perfil = await obtenerPerfil(user.uid);
      setEstado({ usuario: user, perfil, cargando: false });
    });
    return unsubscribe;
  }, []);

  return estado;
}
