"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BookOpen,
  Settings,
  LogOut,
  Stethoscope,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { cerrarSesion } from "@/lib/auth";

const NAV = [
  { href: "/dashboard/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pruebas/", label: "Catálogo de pruebas", icon: BookOpen },
  { href: "/pacientes/", label: "Pacientes", icon: Users },
  { href: "/asignaciones/", label: "Evaluaciones", icon: ClipboardList },
  { href: "/configuracion/", label: "Configuración", icon: Settings },
];

export default function EvaluadorLayout({ children }: { children: React.ReactNode }) {
  const { usuario, perfil, cargando } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);

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
      {menuAbierto && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 shrink-0 -translate-x-full flex-col border-r border-clinical-slate-200 bg-white px-4 py-6 transition-transform duration-200 md:static md:translate-x-0 ${
          menuAbierto ? "translate-x-0" : ""
        }`}
      >
        <div className="mb-8 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-clinical-blue-600" />
            <span className="font-semibold text-clinical-slate-800">SALUS</span>
          </div>
          <button
            onClick={() => setMenuAbierto(false)}
            className="rounded-md p-1 text-clinical-slate-400 hover:bg-clinical-slate-100 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <a
              key={href}
              href={href}
              onClick={() => setMenuAbierto(false)}
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

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-clinical-slate-200 bg-white px-4 py-3 md:hidden">
          <button
            onClick={() => setMenuAbierto(true)}
            className="rounded-md p-1.5 text-clinical-slate-600 hover:bg-clinical-slate-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-clinical-blue-600" />
            <span className="font-semibold text-clinical-slate-800">SALUS</span>
          </div>
        </div>
        <main className="flex-1 overflow-y-auto bg-clinical-slate-50 p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
