import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SALUS Psicométrico",
  description: "Gestión y aplicación de pruebas psicométricas y clínicas.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-clinical-bg font-sans text-clinical-slate-800 antialiased">
        {children}
      </body>
    </html>
  );
}
