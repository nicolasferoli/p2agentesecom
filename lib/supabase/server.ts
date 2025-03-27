import { createServerClient } from '@supabase/ssr';
import { Database } from '@/shared/types/database.types';
import { UserData } from '@/shared/types/supabase';

// Define uma função para criar o cliente Supabase sem depender de cookies
export function createClientWithoutCookies() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
    }
  );
}

// Cria um cliente Supabase para uso específico no App Router onde cookies são necessários
export async function createClient() {
  // Importa cookies() apenas no lado do servidor e dentro da função
  try {
    // Usando import dinâmico para carregar o módulo next/headers
    const headers = await import('next/headers');
    const cookieStore = await headers.cookies();
    
    return createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: async (name: string) => {
            // Fazemos uma verificação simples para garantir
            return cookieStore.get(name)?.value;
          },
          set: async (name: string, value: string, options: any = {}) => {
            cookieStore.set({ name, value, ...options });
          },
          remove: async (name: string, options: any = {}) => {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );
  } catch (error) {
    console.warn('cookies() não disponível, usando cliente sem cookies', error);
    return createClientWithoutCookies();
  }
}

// Função para App Router (Server Components) - usa await para garantir operações assíncronas
export async function getCurrentUserFromServerComponent(): Promise<UserData | null> {
  try {
    const supabase = await createClient();
    
    // Obter o usuário atual
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return null;
    }

    // Obter detalhes do usuário no banco de dados
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError || !userData) {
      return null;
    }

    return userData as UserData;
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    return null;
  }
} 