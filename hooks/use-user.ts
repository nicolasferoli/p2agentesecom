import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserData } from '@/shared/types/supabase';

/**
 * Hook para acessar dados do usuário atual na aplicação
 */
export function useUser() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        // Obter o usuário autenticado
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Buscar dados do usuário no banco
        const { data: userData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profileError || !userData) {
          console.error('Erro ao buscar dados do usuário:', profileError);
          setUser(null);
        } else {
          setUser(userData as UserData);
        }
      } catch (error) {
        console.error('Erro ao obter usuário:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Configurar listener para mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (!error && data) {
            setUser(data as UserData);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
} 