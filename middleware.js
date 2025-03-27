import { NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/ssr';

export async function middleware(req) {
  const res = NextResponse.next();
  
  // Cria o cliente do Supabase usando cookies
  const supabase = createMiddlewareClient({ req, res });
  
  // Atualiza a resposta para incluir novos cookies quando a sessão muda
  await supabase.auth.getSession();
  
  return res;
}

// Configuração para aplicar apenas às rotas que necessitam de autenticação
export const config = {
  matcher: [
    '/(dashboard)/:path*',
    '/agents/:path*',
    '/chat/:path*',
    '/knowledge/:path*',
    '/documents/:path*',
    '/api/:path*'
  ],
}; 