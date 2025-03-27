import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, FileText, Upload, Database, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteKnowledgeButton } from "../_components/delete-knowledge-button";

interface KnowledgeBasePageProps {
  params: {
    knowledgeBaseId: string;
  };
}

export default async function KnowledgeBasePage({ params }: KnowledgeBasePageProps) {
  const supabase = createClient();

  // Verificar autenticação do usuário
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login?callbackUrl=/knowledge");
  }

  // Buscar detalhes da base de conhecimento
  const { data: knowledgeBase, error } = await supabase
    .from("knowledge_base")
    .select("*")
    .eq("id", params.knowledgeBaseId)
    .eq("user_id", session.user.id)
    .single();

  if (error || !knowledgeBase) {
    notFound();
  }

  // Buscar documentos associados a esta base de conhecimento
  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("knowledge_base_id", params.knowledgeBaseId)
    .order("created_at", { ascending: false });

  // Buscar agentes vinculados a esta base de conhecimento
  const { data: agents } = await supabase
    .from("agents")
    .select("id, name, model")
    .eq("knowledge_base_id", params.knowledgeBaseId);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Link href="/knowledge" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Bases de Conhecimento
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Database className="h-6 w-6 mr-2 text-primary" />
              {knowledgeBase.name}
            </h1>
            <p className="text-muted-foreground mt-1 max-w-2xl">
              {knowledgeBase.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/knowledge/${params.knowledgeBaseId}/edit`}>
                Editar Base
              </Link>
            </Button>
            <DeleteKnowledgeButton
              knowledgeBaseId={params.knowledgeBaseId}
              knowledgeBaseName={knowledgeBase.name}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Seção de Documentos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">Documentos</CardTitle>
                <CardDescription>
                  Documentos e conteúdos associados a esta base de conhecimento
                </CardDescription>
              </div>
              <Button asChild>
                <Link href={`/knowledge/${params.knowledgeBaseId}/documents/upload`}>
                  <Upload className="h-4 w-4 mr-2" />
                  Adicionar Documento
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {documents && documents.length > 0 ? (
                <div className="divide-y">
                  {documents.map((doc) => (
                    <div key={doc.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{doc.type}</Badge>
                            <Badge
                              variant={doc.status === "processed" ? "default" : doc.status === "processing" ? "secondary" : "outline"}
                              className="capitalize"
                            >
                              {doc.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button 
                        asChild 
                        variant="ghost" 
                        size="sm" 
                        className="gap-1"
                      >
                        <Link href={`/knowledge/${params.knowledgeBaseId}/documents/${doc.id}`}>
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">Ver documento</span>
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>Nenhum documento adicionado a esta base de conhecimento.</p>
                  <p className="mt-1 text-sm">
                    Adicione documentos para fornecer informações aos seus agentes.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Informações da base */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">ID da Base</dt>
                  <dd className="font-mono text-xs mt-1">{knowledgeBase.id}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Documentos</dt>
                  <dd className="font-medium mt-1">{documents?.length || 0}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Criação</dt>
                  <dd className="mt-1">{new Date(knowledgeBase.created_at).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Última Atualização</dt>
                  <dd className="mt-1">{new Date(knowledgeBase.updated_at).toLocaleDateString()}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Agentes vinculados */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Agentes Vinculados</CardTitle>
            </CardHeader>
            <CardContent>
              {agents && agents.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {agents.map((agent) => (
                    <li key={agent.id} className="border rounded-md p-2">
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-muted-foreground text-xs mt-1">{agent.model}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Nenhum agente está utilizando esta base de conhecimento.
                </p>
              )}
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/agents/create">
                  Criar Novo Agente
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 