import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

import { Button } from "@/components/ui/button";
import { DocumentUploadForm } from "@/app/(dashboard)/knowledge/_components/document-upload-form";

interface UploadDocumentPageProps {
  params: {
    knowledgeBaseId: string;
  };
}

export const metadata = {
  title: "Upload de Documento - P2AgentesEcom",
  description: "Adicione documentos à sua base de conhecimento",
};

export default async function UploadDocumentPage({ params }: UploadDocumentPageProps) {
  const supabase = createClient();

  // Verificar autenticação do usuário
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login?callbackUrl=/knowledge");
  }

  // Verificar se a base de conhecimento existe
  const { data: knowledgeBase, error } = await supabase
    .from("knowledge_base")
    .select("name")
    .eq("id", params.knowledgeBaseId)
    .eq("user_id", session.user.id)
    .single();

  if (error || !knowledgeBase) {
    notFound();
  }

  return (
    <div className="container py-8 max-w-3xl">
      <div className="mb-6">
        <Link 
          href={`/knowledge/${params.knowledgeBaseId}`} 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Base de Conhecimento
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Upload className="h-6 w-6 mr-2 text-primary" />
              Upload de Documento
            </h1>
            <p className="text-muted-foreground mt-1">
              Adicione documentos à base <span className="font-medium">{knowledgeBase.name}</span>
            </p>
          </div>
        </div>
      </div>

      <div>
        <DocumentUploadForm 
          knowledgeBaseId={params.knowledgeBaseId}
          userId={session.user.id}
        />
      </div>
    </div>
  );
} 