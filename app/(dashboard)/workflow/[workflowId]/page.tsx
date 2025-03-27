import Link from "next/link";
import { ArrowLeft, Edit, Play, Calendar, ToggleLeft, ToggleRight } from "lucide-react";
import { redirect, notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getCurrentUserFromServerComponent } from "@/lib/supabase/server";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { DeleteWorkflowButton } from "../_components/delete-workflow-button";

interface WorkflowPageProps {
  params: {
    workflowId: string;
  };
}

export async function generateMetadata({ params }: WorkflowPageProps) {
  const workflowId = params.workflowId;
  
  // Criar cliente Supabase para buscar dados
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  
  const { data: workflow } = await supabase
    .from("workflows")
    .select("name")
    .eq("id", workflowId)
    .single();

  return {
    title: workflow ? `${workflow.name} - Fluxo de Trabalho` : "Fluxo de Trabalho"
  };
}

export default async function WorkflowPage({ params }: WorkflowPageProps) {
  // Obter usuário autenticado
  const user = await getCurrentUserFromServerComponent();

  if (!user) {
    redirect("/login?callbackUrl=/workflow");
  }

  // Criar cliente Supabase para buscar dados
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  // Busca detalhes do fluxo de trabalho
  const { data: workflow, error } = await supabase
    .from("workflows")
    .select("*")
    .eq("id", params.workflowId)
    .eq("user_id", user.id)
    .single();

  if (error || !workflow) {
    notFound();
  }

  // Formatação das datas
  const createdAt = formatDistanceToNow(new Date(workflow.created_at), {
    addSuffix: true,
    locale: ptBR
  });
  const updatedAt = formatDistanceToNow(new Date(workflow.updated_at), {
    addSuffix: true,
    locale: ptBR
  });

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link 
          href="/workflow" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Fluxos de Trabalho
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{workflow.name}</h1>
            <p className="text-muted-foreground mt-1">
              {workflow.description}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" asChild>
              <Link href={`/workflow/${workflow.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/workflow/${workflow.id}/execute`}>
                <Play className="h-4 w-4 mr-2" />
                Executar
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={workflow.enabled ? "default" : "secondary"}>
              {workflow.enabled ? "Ativo" : "Inativo"}
            </Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Criado em</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{createdAt}</span>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Atualizado em</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{updatedAt}</span>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Último Execução</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-muted-foreground">Nunca executado</span>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Configuração do Fluxo</CardTitle>
          <CardDescription>
            Detalhes das etapas configuradas neste fluxo de trabalho
          </CardDescription>
        </CardHeader>
        <CardContent>
          {workflow.config.steps && workflow.config.steps.length > 0 ? (
            <div className="space-y-4">
              {workflow.config.steps.map((step: any, index: number) => (
                <div key={step.id || index} className="border rounded-lg p-4">
                  <h3 className="font-medium">
                    {index + 1}. {step.name || `Etapa ${index + 1}`}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tipo: {step.type || "Básico"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 border rounded-md p-4 bg-muted/40 text-muted-foreground">
              Nenhuma etapa configurada neste fluxo de trabalho.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Execuções</CardTitle>
          <CardDescription>
            Registros das execuções anteriores deste fluxo de trabalho
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 border rounded-md p-4 bg-muted/40 text-muted-foreground">
            Não há registros de execuções anteriores.
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 