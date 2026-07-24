"use client";

import { useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Settings,
  LogOut,
  Stethoscope,
} from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { cerrarSesion } from "@/lib/auth";

const NAV = [
  { href: "/dashboard/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pacientes/", label: "Pacientes", icon: Users },
  { href: "/asignaciones/", label: "Evaluaciones", icon: ClipboardList },
  { href: "/configuracion/", label: "Configuración", icon: Settings },
];

export default function EvaluadorLayout({ children }: { children: React.ReactNode }) {
  const { usuario, perfil, cargando } = useAuth();

  useEffect(() => {
    if (!cargando && !usuario) {
      window.location.href = "/login/";
    }
  }, [cargando, usuario]);

  if (cargando || !usuario) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-clinical-slate-400">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 shrink-0 flex-col border-r border-clinical-slate-200 bg-white px-4 py-6">
        <div className="mb-8 flex items-center gap-2 px-2">
          <Stethoscope className="h-6 w-6 text-clinical-blue-600" />
          <span className="font-semibold text-clinical-slate-800">SALUS</span>
        </div>
        <nav className="flex-1 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <a
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-clinical-slate-600 hover:bg-clinical-slate-100 hover:text-clinical-slate-900"
            >
              <Icon className="h-4 w-4" />
              {label}
            </a>
          ))}
        </nav>
        <div className="border-t border-clinical-slate-100 pt-4">
          <p className="px-2 text-xs text-clinical-slate-400">{perfil?.nombre ?? usuario.email}</p>
          <button
            onClick={async () => {
              await cerrarSesion();
              window.location.href = "/login/";
            }}
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-clinical-slate-600 hover:bg-clinical-slate-100"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-clinical-slate-50 p-8">{children}</main>
    </div>
  );
}
