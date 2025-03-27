import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { getCurrentUserFromServerComponent } from "@/lib/supabase/server";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyAgentsState } from "./_components/empty-agents-state";

export const metadata = {
  title: "Agentes - P2AgentesEcom",
  description: "Gerenciar seus agentes inteligentes"
};

export default async function AgentsPage() {
  // Usar o método que funciona corretamente com cookies
  const user = await getCurrentUserFromServerComponent();
  
  // Verificar autenticação do usuário
  if (!user) {
    redirect("/login?callbackUrl=/agents");
  }

  // Criar cliente Supabase para buscar dados
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  
  // Buscar agentes do usuário
  const { data: agents } = await supabase
    .from("agents")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Meus Agentes</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie e interaja com seus assistentes virtuais
          </p>
        </div>
        <Button asChild>
          <Link href="/agents/create">
            <Plus className="h-4 w-4 mr-2" />
            Criar Agente
          </Link>
        </Button>
      </div>

      {agents && agents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Card key={agent.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{agent.name}</h3>
                    <Badge variant={agent.enabled ? "default" : "secondary"}>
                      {agent.enabled ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="line-clamp-2 text-muted-foreground text-sm">
                    {agent.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Modelo</p>
                      <p className="font-medium">{agent.model}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Temperatura</p>
                      <p className="font-medium">{agent.temperature}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-3 flex justify-between gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link href={`/agents/${agent.id}`}>Detalhes</Link>
                </Button>
                <Button asChild size="sm" className="flex-1">
                  <Link href={`/chat?agent=${agent.id}`}>Conversar</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyAgentsState />
      )}
    </div>
  );
} 