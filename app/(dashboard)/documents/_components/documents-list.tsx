'use client';

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilePlus, Trash2, FileText } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DocumentsListProps {
  userId: string;
}

export function DocumentsList({ userId }: DocumentsListProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadDocuments();
  }, [userId]);

  async function loadDocuments() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao carregar documentos:", error);
        return;
      }

      setDocuments(data || []);
    } catch (error) {
      console.error("Erro ao buscar documentos:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteDocument(id: string) {
    try {
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) {
        alert(`Erro ao excluir documento: ${error.message}`);
        return;
      }

      alert("Documento excluído com sucesso");

      // Atualizar lista de documentos
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (error) {
      console.error("Erro ao excluir documento:", error);
      alert("Ocorreu um erro ao excluir o documento");
    }
  }

  if (loading) {
    return <div className="text-center py-4">Carregando documentos...</div>;
  }

  if (documents.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/30">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhum documento encontrado</h3>
        <p className="text-muted-foreground mb-4">
          Você ainda não adicionou nenhum documento. Documentos são usados para enriquecer seus agentes com conhecimento específico.
        </p>
        <Link href="/documents/upload">
          <Button>
            <FilePlus className="mr-2 h-4 w-4" />
            Adicionar documento
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {documents.map((doc) => (
        <Card key={doc.id}>
          <CardHeader>
            <CardTitle className="line-clamp-1">{doc.title || "Documento sem título"}</CardTitle>
            <CardDescription>
              {formatDistanceToNow(new Date(doc.created_at), {
                addSuffix: true,
                locale: ptBR,
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {doc.description || "Sem descrição"}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/documents/${doc.id}`}>Ver detalhes</Link>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => handleDeleteDocument(doc.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}

      <Card className="border-dashed bg-muted/50 flex flex-col items-center justify-center h-[220px]">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <FilePlus className="h-10 w-10 text-muted-foreground mb-4" />
          <Link href="/documents/upload">
            <Button>Adicionar documento</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
} 