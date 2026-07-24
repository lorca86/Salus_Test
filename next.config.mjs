// Desplegado en Firebase App Hosting (SSR de Next.js), no en Hosting estático:
// `output: "export"` es incompatible con `dynamic = "force-dynamic"`
// (ver app/layout.tsx), así que se deja el modo por defecto (servidor).
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
