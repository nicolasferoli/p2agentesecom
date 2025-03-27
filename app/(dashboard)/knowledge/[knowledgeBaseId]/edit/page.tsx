import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { KnowledgeForm } from "../../_components/knowledge-form";

interface EditKnowledgeBasePageProps {
  params: {
    knowledgeBaseId: string;
  };
}

export const metadata = {
  title: "Editar Base de Conhecimento - P2AgentesEcom",
  description: "Editar as informações da sua base de conhecimento",
};

export default async function EditKnowledgeBasePage({ params }: EditKnowledgeBasePageProps) {
  const supabase = createClient();

  // Verificar autenticação do usuário
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login?callbackUrl=/knowledge");
  }

  // Buscar detalhes da base de conhecimento para edição
  const { data: knowledgeBase, error } = await supabase
    .from("knowledge_base")
    .select("*")
    .eq("id", params.knowledgeBaseId)
    .eq("user_id", session.user.id)
    .single();

  if (error || !knowledgeBase) {
    notFound();
  }

  // Preparar os dados iniciais para o formulário
  const initialData = {
    name: knowledgeBase.name,
    description: knowledgeBase.description || "",
  };

  return (
    <div className="container py-8 max-w-3xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Editar Base de Conhecimento</h1>
        <p className="text-muted-foreground">
          Atualize as informações da sua base de conhecimento
        </p>
      </div>

      <div className="mt-8">
        <KnowledgeForm 
          initialData={initialData}
          userId={session.user.id}
          knowledgeBaseId={params.knowledgeBaseId}
        />
      </div>
    </div>
  );
} 