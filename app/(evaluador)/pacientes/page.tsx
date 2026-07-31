"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/useAuth";
import { crearPaciente, listarPacientes, eliminarPaciente } from "@/lib/patients";
import type { Patient, Sexo } from "@/lib/types";
import { Plus, X, Trash2 } from "lucide-react";

export default function PacientesPage() {
  const { usuario } = useAuth();
  const [pacientes, setPacientes] = useState<Patient[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  const [nombreCompleto, setNombreCompleto] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [sexo, setSexo] = useState<Sexo>("femenino");
  const [notas, setNotas] = useState("");

  useEffect(() => {
    if (!usuario) return;
    void cargar(usuario.uid);
  }, [usuario]);

  async function cargar(evaluadorId: string) {
    setPacientes(await listarPacientes(evaluadorId));
  }

  async function eliminar(e: React.MouseEvent, p: Patient) {
    e.preventDefault();
    e.stopPropagation();
    if (
      !window.confirm(
        `¿Eliminar el expediente de ${p.nombreCompleto}? Se borrarán también todas sus evaluaciones y resultados. Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }
    setEliminandoId(p.id);
    try {
      await eliminarPaciente(p.id);
      setPacientes((prev) => prev.filter((x) => x.id !== p.id));
    } finally {
      setEliminandoId(null);
    }
  }

  function calcularEdad(fechaISO: string): number {
    const nacimiento = new Date(fechaISO);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario) return;
    setGuardando(true);
    try {
      await crearPaciente({
        evaluadorId: usuario.uid,
        nombreCompleto,
        fechaNacimiento,
        edad: calcularEdad(fechaNacimiento),
        sexo,
        notas,
      });
      setNombreCompleto("");
      setFechaNacimiento("");
      setNotas("");
      setMostrarForm(false);
      await cargar(usuario.uid);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-clinical-slate-800">Pacientes</h1>
        <Button onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {mostrarForm ? "Cancelar" : "Nuevo paciente"}
        </Button>
      </div>

      {mostrarForm && (
        <Card className="mb-6">
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-clinical-slate-700">Nombre completo</label>
              <input
                required
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                className="w-full rounded-lg border border-clinical-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-clinical-slate-700">Fecha de nacimiento</label>
              <input
                type="date"
                required
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                className="w-full rounded-lg border border-clinical-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-clinical-slate-700">Sexo / Género</label>
              <select
                value={sexo}
                onChange={(e) => setSexo(e.target.value as Sexo)}
                className="w-full rounded-lg border border-clinical-slate-200 px-3 py-2 text-sm"
              >
                <option value="femenino">Femenino</option>
                <option value="masculino">Masculino</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-clinical-slate-700">Notas</label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="w-full rounded-lg border border-clinical-slate-200 px-3 py-2 text-sm"
                rows={3}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={guardando}>
                {guardando ? "Guardando…" : "Guardar paciente"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-2">
        {pacientes.map((p) => (
          <a key={p.id} href={`/pacientes/detalle/?id=${p.id}`}>
            <Card className="flex items-center justify-between hover:border-clinical-blue-300">
              <div>
                <p className="font-medium text-clinical-slate-800">{p.nombreCompleto}</p>
                <p className="text-sm text-clinical-slate-500">
                  {p.edad} años · {p.sexo}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-clinical-blue-600">Ver expediente →</span>
                <button
                  onClick={(e) => eliminar(e, p)}
                  disabled={eliminandoId === p.id}
                  title="Eliminar paciente"
                  className="rounded-md p-1.5 text-clinical-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          </a>
        ))}
        {pacientes.length === 0 && (
          <p className="text-clinical-slate-400">Aún no hay pacientes registrados.</p>
        )}
      </div>
    </div>
  );
}
