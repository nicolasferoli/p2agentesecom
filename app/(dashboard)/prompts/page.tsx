import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getCurrentUserFromServerComponent } from "@/lib/supabase/server";
import { EmptyPromptState } from "./_components/empty-prompt-state";
import { PromptList } from "./_components/prompt-list";

export const metadata: Metadata = {
  title: "Prompts",
  description: "Gerencie seus prompts personalizados",
};

export default async function PromptsPage() {
  // Obter usuário autenticado
  const user = await getCurrentUserFromServerComponent();
  
  if (!user) {
    redirect("/login");
  }
  
  // Criar cliente Supabase para buscar dados
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  
  const { data: prompts, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });
  
  if (error) {
    console.error("Erro ao buscar prompts:", error);
    throw new Error("Não foi possível carregar os prompts");
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Prompts</h1>
          <p className="text-muted-foreground">
            Crie e gerencie seus prompts para usar com agentes
          </p>
        </div>
        <Button asChild>
          <Link href="/prompts/create">
            <Plus className="mr-2 h-4 w-4" />
            Criar Prompt
          </Link>
        </Button>
      </div>
      
      {prompts.length === 0 ? (
        <EmptyPromptState />
      ) : (
        <PromptList prompts={prompts} />
      )}
    </div>
  );
} 