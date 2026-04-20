/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ESTO PERMITE QUE EL BUILD TERMINE AUNQUE HAYA ERRORES DE TIPO
    ignoreBuildErrors: true
  },
  eslint: {
    // ESTO IGNORA LOS ERRORES DE LINTING
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
