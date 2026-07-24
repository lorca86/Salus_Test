"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/useAuth";

export default function RootPage() {
  const { usuario, cargando } = useAuth();

  useEffect(() => {
    if (cargando) return;
    window.location.href = usuario ? "/dashboard/" : "/login/";
  }, [cargando, usuario]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-clinical-slate-400">Cargando…</p>
    </div>
  );
}
