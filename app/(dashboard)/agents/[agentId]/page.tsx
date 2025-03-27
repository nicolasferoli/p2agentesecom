import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bot, Pencil, MessageSquare, Trash } from "lucide-react";
import { getCurrentUserFromServerComponent } from "@/lib/supabase/server";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

export const metadata = {
  title: "Detalhes do Agente - P2AgentesEcom",
  description: "Visualize os detalhes do seu agente inteligente"
};

export default async function AgentDetailsPage({ 
  params 
}: { 
  params: { agentId: string } 
}) {
  // Obter usuário autenticado
  const user = await getCurrentUserFromServerComponent();
  
  // Verificar autenticação do usuário
  if (!user) {
    redirect("/login?callbackUrl=/agents");
  }

  // Criar cliente Supabase para buscar dados
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  
  // Buscar agente pelo ID
  const { data: agent, error } = await supabase
    .from("agents")
    .select("*")
    .eq("id", params.agentId)
    .eq("user_id", user.id)
    .single();

  if (error || !agent) {
    notFound();
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Link href="/agents" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Agentes
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">{agent.name}</h1>
            <div className="flex items-center gap-2">
              <Badge variant={agent.enabled ? "default" : "secondary"}>
                {agent.enabled ? "Ativo" : "Inativo"}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Criado em {new Date(agent.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href={`/agents/${agent.id}/edit`}>
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/chat?agent=${agent.id}`}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Conversar
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Descrição</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{agent.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prompt do Sistema</CardTitle>
              <CardDescription>
                Instruções que definem o comportamento do agente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap">
                {agent.system_prompt}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium">Modelo</div>
                  <div className="text-sm text-muted-foreground">{agent.model}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Temperatura</div>
                  <div className="text-sm text-muted-foreground">{agent.temperature}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Base de Conhecimento</div>
                  <div className="text-sm text-muted-foreground">
                    {agent.knowledge_base_id ? "Associada" : "Nenhuma"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Status</div>
                  <div className="text-sm text-muted-foreground">
                    {agent.enabled ? "Ativo" : "Inativo"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader className="text-destructive">
              <CardTitle className="text-destructive flex items-center">
                <Trash className="h-4 w-4 mr-2" />
                Zona de Perigo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                A exclusão de um agente é permanente e removerá todas as conversas associadas a ele.
              </p>
              <Button variant="destructive" className="w-full" asChild>
                <Link href={`/agents/${agent.id}/delete`}>
                  Excluir Agente
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 