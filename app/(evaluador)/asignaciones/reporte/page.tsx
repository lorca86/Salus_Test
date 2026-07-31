"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { obtenerAsignacion } from "@/lib/assessments";
import { obtenerTest } from "@/lib/catalog";
import { obtenerPaciente } from "@/lib/patients";
import { obtenerResultadoPorAssessment } from "@/lib/results";
import type { Assessment, Patient, Result, TestDefinition } from "@/lib/types";
import { FileDown, FileText } from "lucide-react";

function ReporteContenido() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";

  const [datos, setDatos] = useState<{
    assessment: Assessment;
    test: TestDefinition;
    paciente: Patient;
    resultado: Result;
  } | null>(null);

  useEffect(() => {
    if (!id) return;
    void cargar();
  }, [id]);

  async function cargar() {
    const assessment = await obtenerAsignacion(id);
    if (!assessment) return;
    const [test, paciente, resultado] = await Promise.all([
      obtenerTest(assessment.testId),
      obtenerPaciente(assessment.patientId),
      obtenerResultadoPorAssessment(id),
    ]);
    if (!test || !paciente || !resultado) return;
    setDatos({ assessment, test, paciente, resultado });
  }

  function textoPlano(): string {
    if (!datos) return "";
    const { test, paciente, resultado } = datos;
    const lineas = [
      "REPORTE CLINICO - SALUS PSICOMETRICO",
      "=====================================",
      `Paciente: ${paciente.nombreCompleto}`,
      `Edad: ${paciente.edad} | Sexo: ${paciente.sexo} | Fecha de nacimiento: ${paciente.fechaNacimiento}`,
      `Prueba aplicada: ${test.nombre} (${test.codigo})`,
      `Fecha de cálculo: ${new Date(resultado.fechaCalculo).toLocaleString("es-MX")}`,
      "-------------------------------------",
      "Puntuaciones directas:",
      ...Object.entries(resultado.puntuacionesDirectas).map(
        ([k, v]) => `  ${k}: ${v}${resultado.clasificaciones?.[k] ? ` (${resultado.clasificaciones[k]})` : ""}`
      ),
      ...(Object.keys(resultado.percentiles).length
        ? ["Percentiles / escalares:", ...Object.entries(resultado.percentiles).map(([k, v]) => `  ${k}: ${v}`)]
        : []),
      `Nivel de riesgo: ${resultado.nivelRiesgo.toUpperCase()}`,
      "-------------------------------------",
      "Resumen:",
      resultado.resumenTexto,
    ];
    return lineas.join("\n");
  }

  function descargarTexto() {
    const blob = new Blob([textoPlano()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte_${datos?.test.codigo}_${datos?.paciente.nombreCompleto.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function descargarPDF() {
    if (!datos) return;
    const { jsPDF } = await import("jspdf");
    const pdfDoc = new jsPDF();
    const lineas = pdfDoc.splitTextToSize(textoPlano(), 180);
    pdfDoc.setFont("courier", "normal");
    pdfDoc.setFontSize(10);
    pdfDoc.text(lineas, 14, 16);
    pdfDoc.save(`reporte_${datos.test.codigo}_${datos.paciente.nombreCompleto.replace(/\s+/g, "_")}.pdf`);
  }

  if (!datos) return <p className="text-clinical-slate-400">Cargando reporte…</p>;

  const { test, paciente, resultado } = datos;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-clinical-slate-800">Reporte clínico</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={descargarTexto}>
            <FileText className="h-4 w-4" /> Texto plano
          </Button>
          <Button onClick={descargarPDF}>
            <FileDown className="h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <p className="text-sm text-clinical-slate-500">Paciente</p>
        <p className="font-medium text-clinical-slate-800">{paciente.nombreCompleto}</p>
        <p className="text-sm text-clinical-slate-500">
          {paciente.edad} años · {paciente.sexo} · Nacimiento: {paciente.fechaNacimiento}
        </p>
      </Card>

      <Card className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-medium text-clinical-slate-800">{test.nombre}</p>
          <RiskBadge nivel={resultado.nivelRiesgo} />
        </div>
        <p className="mb-2 text-sm font-medium text-clinical-slate-700">Puntuaciones directas</p>
        <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
          {Object.entries(resultado.puntuacionesDirectas).map(([k, v]) => (
            <div key={k} className="flex flex-col rounded-md bg-clinical-slate-50 px-3 py-1.5">
              <div className="flex justify-between">
                <span className="text-clinical-slate-500">{k}</span>
                <span className="font-medium text-clinical-slate-800">{v}</span>
              </div>
              {resultado.clasificaciones?.[k] && (
                <span className="text-xs text-clinical-blue-600">{resultado.clasificaciones[k]}</span>
              )}
            </div>
          ))}
        </div>
        {Object.keys(resultado.percentiles).length > 0 && (
          <>
            <p className="mb-2 text-sm font-medium text-clinical-slate-700">Percentiles / escalares</p>
            <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
              {Object.entries(resultado.percentiles).map(([k, v]) => (
                <div key={k} className="flex justify-between rounded-md bg-clinical-slate-50 px-3 py-1.5">
                  <span className="text-clinical-slate-500">{k}</span>
                  <span className="font-medium text-clinical-slate-800">{v}</span>
                </div>
              ))}
            </div>
          </>
        )}
        <p className="text-sm text-clinical-slate-600">{resultado.resumenTexto}</p>
      </Card>
    </div>
  );
}

export default function ReportePage() {
  return (
    <Suspense fallback={null}>
      <ReporteContenido />
    </Suspense>
  );
}
