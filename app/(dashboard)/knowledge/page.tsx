import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Database, Upload, Book } from "lucide-react";
import { getCurrentUserFromServerComponent } from "@/lib/supabase/server";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyKnowledgeBaseState } from "./_components/empty-knowledge-state";

export const metadata = {
  title: "Base de Conhecimento - P2AgentesEcom",
  description: "Gerencie suas bases de conhecimento para os agentes"
};

export default async function KnowledgeBasePage() {
  // Obter usuário autenticado
  const user = await getCurrentUserFromServerComponent();
  
  // Verificar autenticação do usuário
  if (!user) {
    redirect("/login?callbackUrl=/knowledge");
  }

  // Criar cliente Supabase para buscar dados
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  // Buscar bases de conhecimento do usuário
  const { data: knowledgeBases } = await supabase
    .from("knowledge_base")
    .select("*, documents(count)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Bases de Conhecimento</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie conteúdos e documentos para melhorar as respostas dos seus agentes
          </p>
        </div>
        <Button asChild>
          <Link href="/knowledge/create">
            <Plus className="h-4 w-4 mr-2" />
            Nova Base de Conhecimento
          </Link>
        </Button>
      </div>

      {knowledgeBases && knowledgeBases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {knowledgeBases.map((kb) => (
            <Card key={kb.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg flex items-center">
                      <Database className="h-4 w-4 mr-2 text-primary" />
                      {kb.name}
                    </h3>
                    <Badge variant="outline">
                      {kb.documents.count} documento{kb.documents.count !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="line-clamp-2 text-muted-foreground text-sm">
                    {kb.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Criada em</p>
                      <p className="font-medium">{new Date(kb.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Última atualização</p>
                      <p className="font-medium">{new Date(kb.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-3 flex justify-between gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link href={`/knowledge/${kb.id}`}>
                    <Book className="h-4 w-4 mr-2" />
                    Detalhes
                  </Link>
                </Button>
                <Button asChild size="sm" className="flex-1">
                  <Link href={`/knowledge/${kb.id}/documents/upload`}>
                    <Upload className="h-4 w-4 mr-2" />
                    Adicionar
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyKnowledgeBaseState />
      )}
    </div>
  );
} 