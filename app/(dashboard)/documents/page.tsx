import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getCurrentUserFromServerComponent } from "@/lib/supabase/server";
import { DocumentsList } from "./_components/documents-list";

export const metadata: Metadata = {
  title: "Documentos",
  description: "Gerencie seus documentos para uso com agentes",
};

export default async function DocumentsPage() {
  const user = await getCurrentUserFromServerComponent();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Documentos</h1>
        <p className="text-muted-foreground">
          Gerencie seus documentos para uso com agentes
        </p>
      </div>

      <DocumentsList userId={user.id} />
    </div>
  );
} 