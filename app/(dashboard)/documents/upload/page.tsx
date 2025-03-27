import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserFromServerComponent } from "@/lib/supabase/server";
import { DocumentUpload } from "../_components/document-upload";

export const metadata: Metadata = {
  title: "Upload de Documento",
  description: "Envie documentos para usar com agentes",
};

export default async function DocumentUploadPage() {
  const user = await getCurrentUserFromServerComponent();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload de Documento</h1>
        <p className="text-muted-foreground">
          Envie documentos para serem usados com seus agentes de IA
        </p>
      </div>

      <DocumentUpload userId={user.id} />
    </div>
  );
} 