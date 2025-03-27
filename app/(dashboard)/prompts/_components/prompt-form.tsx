"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
import { createClient } from "@/lib/supabase/client";

const promptSchema = z.object({
  name: z.string().min(3, "O nome precisa ter pelo menos 3 caracteres"),
  description: z.string().min(10, "A descrição precisa ter pelo menos 10 caracteres"),
  content: z.string().min(15, "O conteúdo precisa ter pelo menos 15 caracteres"),
  tags: z.string().optional(),
});

type PromptFormValues = z.infer<typeof promptSchema>;

interface PromptFormProps {
  userId: string;
  prompt?: {
    id: string;
    name: string;
    description: string;
    content: string;
    tags: string[] | null;
    version: number;
  };
}

export function PromptForm({ userId, prompt }: PromptFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const defaultValues: Partial<PromptFormValues> = {
    name: prompt?.name || "",
    description: prompt?.description || "",
    content: prompt?.content || "",
    tags: prompt?.tags ? prompt.tags.join(", ") : "",
  };
  
  const form = useForm<PromptFormValues>({
    resolver: zodResolver(promptSchema),
    defaultValues,
  });
  
  async function onSubmit(data: PromptFormValues) {
    setIsSubmitting(true);
    
    try {
      const supabase = createClient();
      const tagsArray = data.tags ? data.tags.split(",").map(tag => tag.trim()) : [];
      
      if (prompt) {
        // Atualizar prompt existente
        const { error } = await supabase
          .from("prompts")
          .update({
            name: data.name,
            description: data.description,
            content: data.content,
            tags: tagsArray.length > 0 ? tagsArray : null,
            version: (prompt.version || 1) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", prompt.id);
          
        if (error) throw error;
        
        toast.success("Seu prompt foi atualizado com sucesso");
      } else {
        // Criar novo prompt
        const { error } = await supabase
          .from("prompts")
          .insert({
            name: data.name,
            description: data.description,
            content: data.content,
            tags: tagsArray.length > 0 ? tagsArray : null,
            user_id: userId,
            version: 1,
          });
          
        if (error) throw error;
        
        toast.success("Seu prompt foi criado com sucesso");
      }
      
      router.push("/prompts");
      router.refresh();
    } catch (error) {
      console.error("Erro ao salvar prompt:", error);
      toast.error("Ocorreu um erro ao salvar o prompt. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }
  
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
                <Input placeholder="Nome do prompt" {...field} />
              </FormControl>
              <FormDescription>
                Um nome curto e descritivo para o seu prompt
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
                  placeholder="Descreva o propósito deste prompt"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Uma breve descrição sobre o que este prompt faz
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conteúdo</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Digite o conteúdo do prompt"
                  className="min-h-[200px] font-mono text-sm"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                O texto do prompt que será utilizado. Pode incluir variáveis no formato {`{variável}`}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input
                  placeholder="Separe as tags por vírgula (ex: marketing, email, vendas)"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Tags para categorizar o prompt (opcional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {prompt ? "Atualizar Prompt" : "Criar Prompt"}
        </Button>
      </form>
    </Form>
  );
} 