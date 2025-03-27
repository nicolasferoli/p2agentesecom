import Link from "next/link";
import { ArrowLeft, Play, FileCheck, AlertCircle } from "lucide-react";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserFromServerComponent } from "@/lib/supabase/server";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata = {
  title: "Executar Fluxo de Trabalho - P2AgentesEcom",
  description: "Execute seu fluxo de trabalho automatizado"
};

interface ExecuteWorkflowPageProps {
  params: {
    workflowId: string;
  };
}

export default async function ExecuteWorkflowPage({ params }: ExecuteWorkflowPageProps) {
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

  // Verificar se o workflow está ativo
  if (!workflow.enabled) {
    return (
      <div className="container py-8 max-w-3xl">
        <div className="mb-6">
          <Link 
            href={`/workflow/${params.workflowId}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para o Fluxo de Trabalho
          </Link>

          <h1 className="text-3xl font-bold">Executar Fluxo de Trabalho</h1>
          <p className="text-muted-foreground mt-1">
            {workflow.name}
          </p>
        </div>

        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Fluxo de Trabalho Inativo</AlertTitle>
          <AlertDescription>
            Este fluxo de trabalho está atualmente desativado. 
            Ative-o na página de edição antes de tentar executá-lo.
          </AlertDescription>
        </Alert>

        <div className="flex justify-end">
          <Button variant="outline" asChild>
            <Link href={`/workflow/${workflow.id}/edit`}>
              Editar Fluxo de Trabalho
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Verificar se há etapas configuradas
  if (!workflow.config.steps || workflow.config.steps.length === 0) {
    return (
      <div className="container py-8 max-w-3xl">
        <div className="mb-6">
          <Link 
            href={`/workflow/${params.workflowId}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para o Fluxo de Trabalho
          </Link>

          <h1 className="text-3xl font-bold">Executar Fluxo de Trabalho</h1>
          <p className="text-muted-foreground mt-1">
            {workflow.name}
          </p>
        </div>

        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuração Incompleta</AlertTitle>
          <AlertDescription>
            Este fluxo de trabalho não possui etapas configuradas.
            Adicione etapas na página de edição antes de executá-lo.
          </AlertDescription>
        </Alert>

        <div className="flex justify-end">
          <Button variant="outline" asChild>
            <Link href={`/workflow/${workflow.id}/edit`}>
              Editar Fluxo de Trabalho
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-3xl">
      <div className="mb-6">
        <Link 
          href={`/workflow/${params.workflowId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para o Fluxo de Trabalho
        </Link>

        <h1 className="text-3xl font-bold">Executar Fluxo de Trabalho</h1>
        <p className="text-muted-foreground mt-1">
          {workflow.name}
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Resumo do Fluxo</CardTitle>
          <CardDescription>
            Verifique as etapas antes de iniciar a execução
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Etapas configuradas:</h3>
              <ul className="list-disc pl-5 space-y-2">
                {workflow.config.steps.map((step: any, index: number) => (
                  <li key={step.id || index}>
                    <span className="font-medium">{step.name || `Etapa ${index + 1}`}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      (Tipo: {step.type || "Básico"})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium mb-2">Informações:</h3>
              <p className="text-sm text-muted-foreground">
                Este é um ambiente de execução simulado. Em uma implementação completa, 
                você poderia visualizar o progresso em tempo real e os resultados de cada etapa.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button>
            <Play className="h-4 w-4 mr-2" />
            Iniciar Execução
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileCheck className="h-5 w-5 mr-2" />
            Resultados da Execução
          </CardTitle>
          <CardDescription>
            Os resultados aparecerão aqui após a execução
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 border rounded-md p-4 bg-muted/40 text-muted-foreground">
            Nenhuma execução iniciada. Clique em "Iniciar Execução" para começar.
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 