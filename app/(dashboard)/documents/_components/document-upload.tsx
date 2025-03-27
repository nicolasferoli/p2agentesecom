'use client';

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { FileUp, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DocumentUploadProps {
  userId: string;
}

export function DocumentUpload({ userId }: DocumentUploadProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [knowledgeBases, setKnowledgeBases] = useState<any[]>([]);
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<string>("");
  const [loadingKnowledgeBases, setLoadingKnowledgeBases] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadKnowledgeBases() {
      try {
        const { data, error } = await supabase
          .from('knowledge_base')
          .select('*')
          .eq('user_id', userId);
        
        if (error) throw error;
        
        setKnowledgeBases(data || []);
        if (data && data.length > 0) {
          setSelectedKnowledgeBase(data[0].id);
        }
      } catch (error) {
        console.error('Erro ao carregar bases de conhecimento:', error);
        setError('Não foi possível carregar as bases de conhecimento');
      } finally {
        setLoadingKnowledgeBases(false);
      }
    }

    loadKnowledgeBases();
  }, [userId, supabase]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Verificar tipo de arquivo (permitir PDF, DOCX, TXT)
    const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Tipo de arquivo não suportado. Por favor, envie um PDF, DOCX ou TXT.");
      return;
    }

    // Verificar tamanho do arquivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      setError("Arquivo muito grande. O tamanho máximo é 10MB.");
      return;
    }

    setFile(selectedFile);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!file) {
      setError("Selecione um arquivo para upload");
      return;
    }

    if (!name.trim()) {
      setError("Nome é obrigatório");
      return;
    }

    if (!selectedKnowledgeBase) {
      setError("Selecione uma base de conhecimento");
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // 1. Fazer upload do arquivo para o Storage
      const fileName = `${userId}/${Date.now()}-${file.name}`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from("documents")
        .upload(fileName, file);

      if (storageError) {
        throw new Error(`Erro ao fazer upload: ${storageError.message}`);
      }

      // 2. Obter URL pública
      const { data: publicUrl } = supabase.storage
        .from("documents")
        .getPublicUrl(fileName);

      // 3. Salvar entrada no banco de dados
      const { error: dbError } = await supabase.from("documents").insert({
        name,
        type: file.type,
        knowledge_base_id: selectedKnowledgeBase,
        user_id: userId,
        status: 'pending',
        metadata: {
          description,
          original_name: file.name,
          size: file.size,
          url: publicUrl.publicUrl
        },
        file_path: fileName
      });

      if (dbError) {
        throw new Error(`Erro ao salvar documento: ${dbError.message}`);
      }

      // Sucesso, redirecionar para a lista de documentos
      router.push("/documents");
      router.refresh();
    } catch (err) {
      console.error("Erro no upload:", err);
      setError(err instanceof Error ? err.message : "Ocorreu um erro durante o upload");
    } finally {
      setUploading(false);
    }
  }

  if (loadingKnowledgeBases) {
    return <div className="text-center py-4">Carregando bases de conhecimento...</div>;
  }

  if (knowledgeBases.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/30">
        <h3 className="text-lg font-medium mb-2">Nenhuma base de conhecimento encontrada</h3>
        <p className="text-muted-foreground mb-4">
          Você precisa criar uma base de conhecimento antes de adicionar documentos.
        </p>
        <Button asChild>
          <a href="/knowledge/create">Criar base de conhecimento</a>
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              placeholder="Nome do documento"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Descrição do documento"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="knowledgeBase">Base de Conhecimento</Label>
            <Select
              value={selectedKnowledgeBase}
              onValueChange={setSelectedKnowledgeBase}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma base de conhecimento" />
              </SelectTrigger>
              <SelectContent>
                {knowledgeBases.map((kb) => (
                  <SelectItem key={kb.id} value={kb.id}>
                    {kb.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Arquivo</Label>
            <div className="border rounded-md p-4 flex flex-col items-center justify-center gap-2">
              <FileUp className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Arraste um arquivo aqui ou clique para buscar
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, DOCX, TXT (máx. 10MB)
              </p>
              <Input
                id="file"
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("file")?.click()}
              >
                Selecionar arquivo
              </Button>
              {file && (
                <p className="text-sm font-medium mt-2">
                  Arquivo selecionado: {file.name}
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/documents")}
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar documento"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 