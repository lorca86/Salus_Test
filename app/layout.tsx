import type { Metadata, Viewport } from "next";
import "./globals.css";

// Toda la app depende de estado de Firebase Auth/Firestore en el cliente
// (sesión del evaluador, kiosco, tokens remotos): no hay nada que valga la
// pena pre-renderizar en build time, y hacerlo falla si las variables
// NEXT_PUBLIC_FIREBASE_* no están disponibles durante el build (p.ej. en
// Firebase App Hosting, donde el build corre antes de inyectar el runtime).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SALUS Psicométrico",
  description: "Gestión y aplicación de pruebas psicométricas y clínicas.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
