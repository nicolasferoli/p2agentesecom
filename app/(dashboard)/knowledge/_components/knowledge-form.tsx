"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Loader2 } from "lucide-react";

// Esquema de validação
const formSchema = z.object({
  name: z
    .string()
    .min(3, { message: "O nome deve ter pelo menos 3 caracteres" })
    .max(50, { message: "O nome não pode ter mais de 50 caracteres" }),
  description: z
    .string()
    .max(500, { message: "A descrição não pode ter mais de 500 caracteres" })
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface KnowledgeFormProps {
  initialData: {
    name: string;
    description: string;
  };
  userId: string;
  knowledgeBaseId?: string;
}

export function KnowledgeForm({
  initialData,
  userId,
  knowledgeBaseId,
}: KnowledgeFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      if (knowledgeBaseId) {
        // Atualizar base existente
        const { error } = await supabase
          .from("knowledge_base")
          .update({
            name: values.name,
            description: values.description || "",
            updated_at: new Date().toISOString(),
          })
          .eq("id", knowledgeBaseId)
          .eq("user_id", userId);

        if (error) throw error;

        toast.success("Base de conhecimento atualizada com sucesso");
        router.refresh();
        router.push(`/knowledge/${knowledgeBaseId}`);
      } else {
        // Criar nova base
        const { data, error } = await supabase
          .from("knowledge_base")
          .insert({
            name: values.name,
            description: values.description || "",
            user_id: userId,
          })
          .select("id")
          .single();

        if (error) throw error;

        toast.success("Base de conhecimento criada com sucesso");
        router.refresh();
        router.push(`/knowledge/${data.id}`);
      }
    } catch (error) {
      console.error("Erro ao salvar base de conhecimento:", error);
      toast.error(
        "Erro ao salvar a base de conhecimento. Por favor, tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nome da base de conhecimento"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                Um nome descritivo para sua base de conhecimento
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
                  placeholder="Descreva o propósito desta base de conhecimento"
                  className="min-h-[120px]"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                Uma breve descrição do conteúdo e finalidade
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (knowledgeBaseId) {
                router.push(`/knowledge/${knowledgeBaseId}`);
              } else {
                router.push("/knowledge");
              }
            }}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {knowledgeBaseId ? "Atualizar" : "Criar"} Base
          </Button>
        </div>
      </form>
    </Form>
  );
} 