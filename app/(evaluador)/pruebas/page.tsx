"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/lib/useAuth";
import { listarPacientes } from "@/lib/patients";
import { listarCatalogo } from "@/lib/catalog";
import { crearAsignacion } from "@/lib/assessments";
import { CATEGORIAS, infoCategoria } from "@/lib/categorias";
import type { CategoriaTest, Patient, TestDefinition } from "@/lib/types";
import { ClipboardList, Eye, Loader2, Layers } from "lucide-react";
import clsx from "clsx";

type EntradaCatalogo =
  | { tipo: "individual"; test: TestDefinition }
  | { tipo: "grupo"; grupo: string; nombreGrupo: string; variantes: TestDefinition[] };

// Instrumentos con varias versiones (p.ej. Perfil Sensorial-2: Breve/Escolar)
// comparten `test.grupo` y se muestran como UNA sola tarjeta con selector de
// versión, en vez de saturar el catálogo con una tarjeta por variante.
function agruparCatalogo(tests: TestDefinition[]): EntradaCatalogo[] {
  const entradas: EntradaCatalogo[] = [];
  const indicePorGrupo = new Map<string, number>();
  for (const test of tests) {
    if (!test.grupo) {
      entradas.push({ tipo: "individual", test });
      continue;
    }
    const idx = indicePorGrupo.get(test.grupo);
    if (idx === undefined) {
      indicePorGrupo.set(test.grupo, entradas.length);
      entradas.push({
        tipo: "grupo",
        grupo: test.grupo,
        nombreGrupo: test.nombreGrupo ?? test.grupo,
        variantes: [test],
      });
    } else {
      const entrada = entradas[idx];
      if (entrada.tipo === "grupo") entrada.variantes.push(test);
    }
  }
  return entradas;
}

function CatalogoContenido() {
  const { usuario } = useAuth();
  const params = useSearchParams();
  const patientIdInicial = params.get("patientId") ?? "";

  const [pacientes, setPacientes] = useState<Patient[]>([]);
  const [catalogo, setCatalogo] = useState<TestDefinition[]>([]);
  const [patientId, setPatientId] = useState(patientIdInicial);
  const [creandoObservacion, setCreandoObservacion] = useState<string | null>(null);
  const [errorPacientes, setErrorPacientes] = useState<string | null>(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState<CategoriaTest | "todas">("todas");

  // Se cargan por separado: si listar pacientes falla (p.ej. falta un índice
  // de Firestore), no debe tumbar también el catálogo de pruebas.
  useEffect(() => {
    if (!usuario) return;
    listarCatalogo()
      .then(setCatalogo)
      .catch((err) => console.error("Error al cargar el catálogo:", err));
    listarPacientes(usuario.uid)
      .then(setPacientes)
      .catch((err) => {
        console.error("Error al cargar pacientes:", err);
        setErrorPacientes(
          "No se pudo cargar la lista de pacientes (revisa la consola del navegador; puede faltar un índice de Firestore)."
        );
      });
  }, [usuario]);

  const pacienteSeleccionado = pacientes.find((p) => p.id === patientId) ?? null;
  const catalogoFiltrado = catalogo.filter(
    (test) => categoriaFiltro === "todas" || test.categoria === categoriaFiltro
  );

  async function iniciarObservacion(test: TestDefinition) {
    if (!usuario || !pacienteSeleccionado) return;
    setCreandoObservacion(test.id);
    try {
      const assessment = await crearAsignacion({
        testId: test.id,
        patientId: pacienteSeleccionado.id,
        evaluadorId: usuario.uid,
        modalidad: "presencial",
        paciente: pacienteSeleccionado,
      });
      window.location.href = `/observacion/?id=${assessment.id}`;
    } finally {
      setCreandoObservacion(null);
    }
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-clinical-slate-800">Catálogo de pruebas</h1>
      <p className="mb-6 text-sm text-clinical-slate-500">
        Elige un paciente (opcional) y luego una prueba para aplicarla ahora mismo, aquí en tu panel.
      </p>

      <Card className="mb-6">
        <label className="mb-1 block text-sm font-medium text-clinical-slate-700">
          Paciente para esta sesión
        </label>
        <select
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-clinical-slate-200 px-3 py-2 text-sm"
        >
          <option value="">Sin paciente (solo ver resultado, no se guarda)</option>
          {pacientes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombreCompleto}
            </option>
          ))}
        </select>
        {errorPacientes && <p className="mt-2 text-xs text-red-600">{errorPacientes}</p>}
        <p className="mt-2 text-xs text-clinical-slate-400">
          Si no eliges paciente ahora, en autoinformes igual podrás adjuntarlo al terminar, antes de
          guardar. Las pruebas de observación sí requieren paciente para iniciar.
        </p>
      </Card>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setCategoriaFiltro("todas")}
          className={clsx(
            "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
            categoriaFiltro === "todas"
              ? "bg-clinical-slate-800 text-white"
              : "bg-clinical-slate-100 text-clinical-slate-600 hover:bg-clinical-slate-200"
          )}
        >
          Todas
        </button>
        {CATEGORIAS.map((cat) => (
          <button
            key={cat.valor}
            onClick={() => setCategoriaFiltro(cat.valor)}
            className={clsx(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              categoriaFiltro === cat.valor
                ? cat.pill
                : "bg-clinical-slate-100 text-clinical-slate-600 hover:bg-clinical-slate-200"
            )}
          >
            <span className={clsx("h-2 w-2 rounded-full", cat.dot)} />
            {cat.etiqueta}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {agruparCatalogo(catalogoFiltrado).map((entrada) => {
          if (entrada.tipo === "individual") {
            const test = entrada.test;
            const esObservacion = test.tipo === "observacion";
            const deshabilitada = esObservacion && !pacienteSeleccionado;
            const catInfo = infoCategoria(test.categoria);
            return (
              <Card key={test.id} className="flex flex-col justify-between">
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {esObservacion ? (
                        <Eye className="h-4 w-4 text-clinical-blue-600" />
                      ) : (
                        <ClipboardList className="h-4 w-4 text-clinical-blue-600" />
                      )}
                      <p className="font-medium text-clinical-slate-800">{test.nombre}</p>
                    </div>
                    <span className={clsx("shrink-0 rounded-full px-2 py-0.5 text-xs font-medium", catInfo.badge)}>
                      {catInfo.etiqueta}
                    </span>
                  </div>
                  <p className="mb-4 text-sm text-clinical-slate-500">
                    {esObservacion ? "Observación clínica (solo evaluador)" : "Autoinforme"}
                    {test.tiempoLimiteMin ? ` · ~${test.tiempoLimiteMin} min` : ""}
                  </p>
                </div>
                {esObservacion ? (
                  <button
                    disabled={deshabilitada || creandoObservacion === test.id}
                    onClick={() => iniciarObservacion(test)}
                    className="rounded-lg bg-clinical-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-clinical-blue-700 disabled:opacity-40"
                    title={deshabilitada ? "Selecciona un paciente arriba primero" : undefined}
                  >
                    {creandoObservacion === test.id ? (
                      <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                    ) : (
                      "Iniciar registro"
                    )}
                  </button>
                ) : (
                  <a
                    href={`/pruebas/ejecutar/?testId=${test.id}${patientId ? `&patientId=${patientId}` : ""}`}
                    className="rounded-lg bg-clinical-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-clinical-blue-700"
                  >
                    Aplicar ahora
                  </a>
                )}
              </Card>
            );
          }

          // Tarjeta de grupo: una prueba con varias versiones (Perfil Sensorial-2, etc.)
          const catInfo = infoCategoria(entrada.variantes[0].categoria);
          return (
            <Card key={entrada.grupo} className="flex flex-col">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-clinical-blue-600" />
                  <p className="font-medium text-clinical-slate-800">{entrada.nombreGrupo}</p>
                </div>
                <span className={clsx("shrink-0 rounded-full px-2 py-0.5 text-xs font-medium", catInfo.badge)}>
                  {catInfo.etiqueta}
                </span>
              </div>
              <p className="mb-3 text-sm text-clinical-slate-500">Elige la versión a aplicar:</p>
              <div className="space-y-2">
                {entrada.variantes.map((variante) => {
                  const esObservacion = variante.tipo === "observacion";
                  const deshabilitada = esObservacion && !pacienteSeleccionado;
                  return (
                    <div
                      key={variante.id}
                      className="flex items-center justify-between rounded-lg border border-clinical-slate-200 px-3 py-2"
                    >
                      <span className="text-sm text-clinical-slate-700">
                        {variante.nombreVariante ?? variante.nombre}
                      </span>
                      {esObservacion ? (
                        <button
                          disabled={deshabilitada || creandoObservacion === variante.id}
                          onClick={() => iniciarObservacion(variante)}
                          className="rounded-md bg-clinical-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-clinical-blue-700 disabled:opacity-40"
                        >
                          {creandoObservacion === variante.id ? "…" : "Iniciar"}
                        </button>
                      ) : (
                        <a
                          href={`/pruebas/ejecutar/?testId=${variante.id}${patientId ? `&patientId=${patientId}` : ""}`}
                          className="rounded-md bg-clinical-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-clinical-blue-700"
                        >
                          Aplicar
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
        {catalogo.length === 0 && (
          <p className="text-clinical-slate-400">
            El catálogo está vacío. Corre <code>npm run seed</code> para cargarlo.
          </p>
        )}
        {catalogo.length > 0 && catalogoFiltrado.length === 0 && (
          <p className="text-clinical-slate-400">No hay pruebas en esta categoría.</p>
        )}
      </div>
    </div>
  );
}

export default function CatalogoPage() {
  return (
    <Suspense fallback={null}>
      <CatalogoContenido />
    </Suspense>
  );
}
