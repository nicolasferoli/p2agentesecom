import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/shared/types/database.types';
import { UserData } from '@/shared/types/supabase';

// Usando tipagem mais simples por enquanto
export function createClient() {
  const cookieStore = cookies();
  
  // @ts-ignore - Ignorando erros de tipagem por enquanto
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Fallback para quando cookies.set não estiver disponível (em alguns contextos do Next.js)
            console.warn('Não foi possível definir o cookie:', name);
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options, maxAge: 0 });
          } catch (error) {
            // Fallback para quando cookies.set não estiver disponível (em alguns contextos do Next.js)
            console.warn('Não foi possível remover o cookie:', name);
          }
        },
      },
    }
  );
}

export async function getCurrentUser(): Promise<UserData | null> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data?.user) {
      return null;
    }
    
    const user = data.user;
    
    // Como solução temporária, vamos retornar apenas os dados básicos do usuário
    return {
      id: user.id,
      email: user.email!,
      role: 'user', // Valor padrão
      name: user.user_metadata?.name,
      avatar_url: user.user_metadata?.avatar_url,
    };
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
} 