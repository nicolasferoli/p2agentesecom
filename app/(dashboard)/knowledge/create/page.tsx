import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import { KnowledgeForm } from "../_components/knowledge-form";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const metadata = {
  title: "Criar Base de Conhecimento - P2AgentesEcom",
  description: "Crie uma nova base de conhecimento para seus agentes"
};

export default async function CreateKnowledgeBasePage() {
  const supabase = createClient();
  
  // Verificar autenticação do usuário
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login?callbackUrl=/knowledge/create");
  }

  // Dados iniciais para o formulário
  const initialData = {
    name: "",
    description: "",
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">Criar Base de Conhecimento</h1>
          <p className="text-muted-foreground mt-1">
            Configure uma base de conhecimento para fornecer informações contextuais aos seus agentes
          </p>
        </div>
        
        <KnowledgeForm 
          initialData={initialData}
          userId={session.user.id}
        />
      </div>
    </div>
  );
} 