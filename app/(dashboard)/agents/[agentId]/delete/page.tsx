"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash, Loader2, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

export default function DeleteAgentPage({ 
  params 
}: { 
  params: { agentId: string } 
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    
    try {
      const supabase = createClient();
      
      // Verificar se o usuário tem permissão para excluir o agente
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Você precisa estar autenticado para realizar esta ação");
      }
      
      // Verificar se o agente existe e pertence ao usuário
      const { data: agent, error: fetchError } = await supabase
        .from("agents")
        .select("user_id")
        .eq("id", params.agentId)
        .single();
        
      if (fetchError || !agent) {
        throw new Error("Agente não encontrado");
      }
      
      if (agent.user_id !== user.id) {
        throw new Error("Você não tem permissão para excluir este agente");
      }
      
      // Excluir o agente
      const { error: deleteError } = await supabase
        .from("agents")
        .delete()
        .eq("id", params.agentId);
        
      if (deleteError) {
        throw new Error("Erro ao excluir o agente. Por favor, tente novamente.");
      }
      
      // Redirecionar para a lista de agentes
      router.push("/agents");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro inesperado");
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="container py-16 max-w-md mx-auto">
      <Link href={`/agents/${params.agentId}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para detalhes do agente
      </Link>
      
      <Card className="border-destructive/50">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-destructive flex items-center">
            <Trash className="h-5 w-5 mr-2" />
            Excluir Agente
          </CardTitle>
          <CardDescription>
            Esta ação não pode ser desfeita. Seu agente será excluído permanentemente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-2">
            <p>Ao confirmar a exclusão:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Todas as conversas com este agente serão removidas</li>
              <li>Todas as configurações serão perdidas</li>
              <li>Quaisquer integrações que dependam desse agente deixarão de funcionar</li>
            </ul>
          </div>
          
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive text-destructive text-sm rounded-md">
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2 flex-col sm:flex-row">
          <Button
            variant="outline"
            className="sm:flex-1"
            asChild
            disabled={isDeleting}
          >
            <Link href={`/agents/${params.agentId}`}>
              Cancelar
            </Link>
          </Button>
          <Button
            variant="destructive"
            className="sm:flex-1"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Confirmar Exclusão"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 