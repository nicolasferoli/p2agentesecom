/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'p2agentesecom.vercel.app', '*.vercel.app']
    }
  },
  // Force all pages to be dynamically rendered
  reactStrictMode: true,
  // Desabilitar a geração estática para todo o site
  staticPageGenerationTimeout: 1000,
  // Forçar todos os componentes a serem renderizados no servidor
  compiler: {
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kfkcjaqbrkagkjrqzshf.supabase.co',
        pathname: '**',
      }
    ],
    domains: ['kfkcjaqbrkagkjrqzshf.supabase.co']
  },
  // Configuração para evitar build estático de rotas que usam cookies
  // e são dinâmicas por natureza
  transpilePackages: ['@supabase/auth-ui-react', '@supabase/supabase-js'],
};

module.exports = nextConfig; 