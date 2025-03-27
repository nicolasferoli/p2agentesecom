import { Suspense } from "react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { getCurrentUserFromServerComponent } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { WorkflowList } from "./_components/workflow-list";
import { EmptyWorkflowState } from "./_components/empty-workflow-state";
import { Metadata } from "next";

export const metadata = {
  title: "Fluxos de Trabalho - P2AgentesEcom",
  description: "Gerencie seus fluxos de trabalho automatizados",
};

export default async function WorkflowPage() {
  // Obter usuário autenticado
  const user = await getCurrentUserFromServerComponent();

  if (!user) {
    redirect("/login?callbackUrl=/workflow");
  }

  // Criar cliente Supabase para buscar dados
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  // Busca os fluxos de trabalho do usuário
  const { data: workflows, error } = await supabase
    .from("workflows")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar fluxos de trabalho:", error);
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Fluxos de Trabalho</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie e configure fluxos de trabalho automatizados com seus agentes
          </p>
        </div>
        <Link href="/workflow/create">
          <Button className="w-full md:w-auto">
            <PlusCircle className="h-4 w-4 mr-2" />
            Criar Fluxo de Trabalho
          </Button>
        </Link>
      </div>

      {!workflows || workflows.length === 0 ? (
        <EmptyWorkflowState />
      ) : (
        <Suspense fallback={<div>Carregando fluxos de trabalho...</div>}>
          <WorkflowList workflows={workflows} />
        </Suspense>
      )}
    </div>
  );
} 