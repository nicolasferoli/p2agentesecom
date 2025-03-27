'use client';

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function UsersList() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadUsers() {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Erro ao carregar usuários:", error);
          return;
        }

        setUsers(data || []);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [supabase]);

  if (loading) {
    return <div className="text-center py-4">Carregando usuários...</div>;
  }

  if (users.length === 0) {
    return <div className="text-center py-4">Nenhum usuário encontrado.</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuário</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead>Último login</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url} alt={user.email} />
                    <AvatarFallback>
                      {user.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span>{user.full_name || user.email}</span>
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {user.confirmed_at ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Ativo
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                    Pendente
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {user.created_at
                  ? formatDistanceToNow(new Date(user.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })
                  : "-"}
              </TableCell>
              <TableCell>
                {user.last_sign_in_at
                  ? formatDistanceToNow(new Date(user.last_sign_in_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })
                  : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 