import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserFromServerComponent } from "@/lib/supabase/server";

import { WorkflowForm } from "../../_components/workflow-form";

export const metadata = {
  title: "Editar Fluxo de Trabalho - P2AgentesEcom",
  description: "Edite seu fluxo de trabalho existente",
};

interface EditWorkflowPageProps {
  params: {
    workflowId: string;
  };
}

export default async function EditWorkflowPage({ params }: EditWorkflowPageProps) {
  const user = await getCurrentUserFromServerComponent();

  if (!user) {
    redirect("/login?callbackUrl=/workflow");
  }

  const supabase = createClient();
  
  // Buscar detalhes do fluxo de trabalho
  const { data: workflow, error } = await supabase
    .from("workflows")
    .select("*")
    .eq("id", params.workflowId)
    .eq("user_id", user.id)
    .single();

  if (error || !workflow) {
    notFound();
  }

  return (
    <div className="container py-8 max-w-5xl">
      <div className="mb-6">
        <Link 
          href={`/workflow/${params.workflowId}`} 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Detalhes do Fluxo
        </Link>

        <h1 className="text-3xl font-bold">Editar Fluxo de Trabalho</h1>
        <p className="text-muted-foreground mt-1">
          Edite as configurações do seu fluxo de trabalho
        </p>
      </div>

      <WorkflowForm 
        initialData={workflow}
        userId={user.id}
        workflowId={params.workflowId}
      />
    </div>
  );
} 