import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileUp, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/csv"
];

const formSchema = z.object({
  name: z
    .string()
    .min(3, { message: "O nome deve ter pelo menos 3 caracteres" })
    .max(50, { message: "O nome não pode ter mais de 50 caracteres" }),
  description: z
    .string()
    .max(300, { message: "A descrição não pode ter mais de 300 caracteres" })
    .optional(),
  file: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: `Tamanho máximo do arquivo é ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    })
    .refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), {
      message: "Formato de arquivo não suportado. Use PDF, DOCX, DOC, TXT ou CSV",
    }),
});

type FormValues = z.infer<typeof formSchema>;

interface DocumentUploadFormProps {
  knowledgeBaseId: string;
  userId: string;
}

export function DocumentUploadForm({
  knowledgeBaseId,
  userId,
}: DocumentUploadFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      setSelectedFile(file);
      form.setValue("file", file);
      
      // Pré-preencher o nome do documento com o nome do arquivo
      if (!form.getValues("name")) {
        const fileName = file.name.split(".")[0];
        form.setValue("name", fileName);
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    form.setValue("file", undefined as any);
    form.clearErrors("file");
  };

  const onSubmit = async (values: FormValues) => {
    if (!selectedFile) {
      toast.error("Por favor, selecione um arquivo para upload");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Criar registro do documento no banco de dados
      const { data: document, error: dbError } = await supabase
        .from("documents")
        .insert({
          name: values.name,
          description: values.description || "",
          type: selectedFile.type,
          size: selectedFile.size,
          knowledge_base_id: knowledgeBaseId,
          user_id: userId,
          status: "pending", // Status inicial
        })
        .select("id")
        .single();

      if (dbError) throw dbError;

      // 2. Fazer upload do arquivo para o storage
      const filePath = `documents/${knowledgeBaseId}/${document.id}/${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("knowledge")
        .upload(filePath, selectedFile);

      if (uploadError) {
        // Se o upload falhar, excluir o registro do documento
        await supabase
          .from("documents")
          .delete()
          .eq("id", document.id);
          
        throw uploadError;
      }

      // 3. Atualizar o documento com o caminho do arquivo e marcar como processando
      const { error: updateError } = await supabase
        .from("documents")
        .update({
          file_path: filePath,
          status: "processing",
        })
        .eq("id", document.id);

      if (updateError) throw updateError;

      // 4. Aqui você chamaria uma função serverless para processar o documento
      // Isso seria implementado com uma função Edge ou Hook do Supabase
      // Por enquanto, vamos simular marcando como processado
      setTimeout(async () => {
        await supabase
          .from("documents")
          .update({
            status: "processed",
          })
          .eq("id", document.id);
      }, 3000);

      toast.success("Documento enviado com sucesso");
      router.refresh();
      router.push(`/knowledge/${knowledgeBaseId}`);
    } catch (error) {
      console.error("Erro ao fazer upload do documento:", error);
      toast.error("Erro ao fazer upload do documento. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Upload de Documento</CardTitle>
        <CardDescription>
          Adicione um documento à sua base de conhecimento para que seus agentes possam acessá-lo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Documento</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome descritivo para o documento"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Um nome fácil de identificar para este documento
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o conteúdo deste documento"
                      className="min-h-[80px]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Uma breve descrição do que este documento contém
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="file"
              render={() => (
                <FormItem>
                  <FormLabel>Arquivo</FormLabel>
                  <FormControl>
                    <div className="mt-2">
                      {!selectedFile ? (
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center hover:border-primary/50 transition-colors">
                          <Input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            onChange={onFileChange}
                            accept=".pdf,.doc,.docx,.txt,.csv"
                            disabled={isSubmitting}
                          />
                          <label
                            htmlFor="file-upload"
                            className="cursor-pointer flex flex-col items-center justify-center"
                          >
                            <FileUp className="h-8 w-8 text-muted-foreground mb-4" />
                            <span className="text-muted-foreground font-medium">
                              Clique para selecionar um arquivo
                            </span>
                            <span className="text-xs text-muted-foreground/70 mt-2">
                              PDF, DOCX, DOC, TXT ou CSV (máx. 10MB)
                            </span>
                          </label>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between bg-muted p-3 rounded-md">
                          <div className="flex items-center">
                            <FileUp className="h-5 w-5 text-primary mr-2" />
                            <div>
                              <p className="text-sm font-medium">{selectedFile.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removeFile}
                            disabled={isSubmitting}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remover arquivo</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Selecione um arquivo para enviar para a base de conhecimento
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/knowledge/${knowledgeBaseId}`)}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting || !selectedFile}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <FileUp className="mr-2 h-4 w-4" />
              Enviar Documento
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 