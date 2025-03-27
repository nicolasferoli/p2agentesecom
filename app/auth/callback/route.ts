import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Erro ao trocar código por sessão:', error);
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=Falha%20na%20verificação.%20Tente%20novamente.`
        );
      }
      
      return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
    } catch (error) {
      console.error('Erro no processo de callback:', error);
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=Ocorreu%20um%20erro.%20Tente%20novamente.`
      );
    }
  }

  // Caso não tenha código, redireciona para a página inicial
  return NextResponse.redirect(`${requestUrl.origin}/login`);
} 