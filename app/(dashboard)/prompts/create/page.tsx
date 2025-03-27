import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserFromServerComponent } from "@/lib/supabase/server";
import { PromptForm } from "../_components/prompt-form";

export const metadata: Metadata = {
  title: "Criar Prompt",
  description: "Crie um novo prompt para usar com seus agentes",
};

export default async function CreatePromptPage() {
  const user = await getCurrentUserFromServerComponent();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Criar Prompt</h1>
        <p className="text-muted-foreground">
          Crie um novo prompt para usar com seus agentes
        </p>
      </div>

      <PromptForm userId={user.id} />
    </div>
  );
} 