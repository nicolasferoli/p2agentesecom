import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentUserFromServerComponent } from "@/lib/supabase/server";

import { AgentForm } from "../../_components/agent-form";

export const metadata = {
  title: "Editar Agente - P2AgentesEcom",
  description: "Editar as configurações do seu agente inteligente"
};

export default async function EditAgentPage({ 
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

  // Buscar agentes disponíveis para configurações multi/sequencial/condicional
  // Excluindo o próprio agente sendo editado
  const { data: availableAgents } = await supabase
    .from("agents")
    .select("id, name")
    .eq("user_id", user.id)
    .eq("agent_type", "standard")
    .neq("id", params.agentId)
    .order("name");

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-6 max-w-3xl mx-auto">
        <div>
          <Link href={`/agents/${params.agentId}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para detalhes do agente
          </Link>
          
          <h1 className="text-3xl font-bold">Editar Agente</h1>
          <p className="text-muted-foreground mt-1">
            Atualize as configurações do seu assistente virtual
          </p>
        </div>
        
        <AgentForm 
          initialData={agent}
          userId={user.id}
          agentId={params.agentId}
          availableAgents={availableAgents || []}
        />
      </div>
    </div>
  );
} 