import { redirect } from "next/navigation";
import { getCurrentUserFromServerComponent } from "@/lib/supabase/server";

import { AgentForm } from "../_components/agent-form";

export const metadata = {
  title: "Criar Agente - P2AgentesEcom",
  description: "Crie um novo agente inteligente personalizado"
};

export default async function CreateAgentPage() {
  // Obter usuário autenticado
  const user = await getCurrentUserFromServerComponent();
  
  // Verificar autenticação do usuário
  if (!user) {
    redirect("/login?callbackUrl=/agents/create");
  }

  // Criar cliente Supabase para buscar dados
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  // Buscar agentes disponíveis para configurações multi/sequencial/condicional
  const { data: availableAgents } = await supabase
    .from("agents")
    .select("id, name")
    .eq("user_id", user.id)
    .eq("agent_type", "standard")
    .order("name");

  // Dados iniciais para o formulário
  const initialData = {
    name: "",
    description: "",
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    system_prompt: "Você é um assistente útil e amigável.",
    enabled: true,
    output_parser: "text",
    agent_type: "standard",
    parent_agent_id: null,
    execution_order: null,
    condition: null,
    custom_parser_code: null
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">Criar Novo Agente</h1>
          <p className="text-muted-foreground mt-1">
            Configure seu assistente virtual personalizado
          </p>
        </div>
        
        <AgentForm 
          initialData={initialData}
          userId={user.id}
          availableAgents={availableAgents || []}
        />
      </div>
    </div>
  );
} 