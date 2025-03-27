import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserFromServerComponent } from "@/lib/supabase/server";

import { WorkflowForm } from "../_components/workflow-form";

export const metadata = {
  title: "Criar Fluxo de Trabalho - P2AgentesEcom",
  description: "Configure um novo fluxo de trabalho automatizado",
};

export default async function CreateWorkflowPage() {
  const user = await getCurrentUserFromServerComponent();

  if (!user) {
    redirect("/login?callbackUrl=/workflow/create");
  }

  // Dados iniciais para o formulário
  const initialData = {
    name: "",
    description: "",
    config: { steps: [] },
    enabled: true,
  };

  return (
    <div className="container py-8 max-w-5xl">
      <div className="mb-6">
        <Link 
          href="/workflow" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Fluxos de Trabalho
        </Link>

        <h1 className="text-3xl font-bold">Criar Fluxo de Trabalho</h1>
        <p className="text-muted-foreground mt-1">
          Configure um fluxo de trabalho automatizado com seus agentes
        </p>
      </div>

      <WorkflowForm 
        initialData={initialData}
        userId={user.id} 
      />
    </div>
  );
} 