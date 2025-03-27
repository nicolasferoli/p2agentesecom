import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getCurrentUserFromServerComponent } from "@/lib/supabase/server";
import { PromptForm } from "../_components/prompt-form";

export const metadata: Metadata = {
  title: "Editar Prompt",
  description: "Edite seu prompt existente",
};

interface EditPromptPageProps {
  params: {
    id: string;
  };
}

export default async function EditPromptPage({ params }: EditPromptPageProps) {
  const promptId = params.id;
  const user = await getCurrentUserFromServerComponent();

  if (!user) {
    redirect("/login");
  }

  // Criar cliente Supabase para buscar dados
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  
  // Buscar prompt pelo ID
  const { data: prompt, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("id", promptId)
    .single();

  if (error || !prompt) {
    console.error("Erro ao buscar prompt:", error);
    return notFound();
  }

  // Verificar se o prompt pertence ao usuário
  if (prompt.user_id !== user.id) {
    redirect("/prompts");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar Prompt</h1>
        <p className="text-muted-foreground">
          Edite seu prompt existente
        </p>
      </div>

      <PromptForm userId={user.id} prompt={prompt} />
    </div>
  );
} 