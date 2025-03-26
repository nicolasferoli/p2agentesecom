import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/shared/types/database.types';
import { UserData } from '@/shared/types/supabase';

// Simplificado para contornar os problemas de tipagem
export function createClient() {
  // @ts-ignore - Ignorando erros de tipagem por enquanto
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookies().set(name, value, options);
          } catch (error) {
            console.warn('Não foi possível definir o cookie:', name);
          }
        },
        remove(name: string, options: any) {
          try {
            cookies().set({ name, value: '', ...options, maxAge: 0 });
          } catch (error) {
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