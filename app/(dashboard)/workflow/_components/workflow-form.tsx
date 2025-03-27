"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Network, Loader2, Save } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { FlowEditor } from "./flow-editor";

// Esquema de validação para o formulário
const formSchema = z.object({
  name: z
    .string()
    .min(3, { message: "O nome deve ter pelo menos 3 caracteres" })
    .max(50, { message: "O nome não pode ter mais de 50 caracteres" }),
  description: z
    .string()
    .min(10, { message: "A descrição deve ter pelo menos 10 caracteres" })
    .max(500, { message: "A descrição não pode ter mais de 500 caracteres" }),
  enabled: z.boolean(),
  config: z.object({
    steps: z.array(z.any()).optional(),
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface WorkflowFormProps {
  initialData: {
    name: string;
    description: string;
    enabled: boolean;
    config: {
      steps: any[];
    };
  };
  userId: string;
  workflowId?: string;
}

export function WorkflowForm({
  initialData,
  userId,
  workflowId,
}: WorkflowFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flowConfig, setFlowConfig] = useState(initialData.config);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData.name,
      description: initialData.description,
      enabled: initialData.enabled,
      config: initialData.config,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      // Combinar formulário com configuração do fluxo
      const workflowData = {
        ...values,
        config: flowConfig,
        user_id: userId,
      };

      if (workflowId) {
        // Atualização de fluxo existente
        const { error } = await supabase
          .from("workflows")
          .update(workflowData)
          .eq("id", workflowId);

        if (error) throw error;
        
        toast.success("Fluxo de trabalho atualizado com sucesso!");
      } else {
        // Criação de novo fluxo
        const { error } = await supabase
          .from("workflows")
          .insert(workflowData);

        if (error) throw error;
        
        toast.success("Fluxo de trabalho criado com sucesso!");
      }

      router.refresh();
      router.push("/workflow");
    } catch (error) {
      console.error("Erro ao salvar fluxo de trabalho:", error);
      toast.error("Erro ao salvar fluxo de trabalho. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFlowConfigChange = (newConfig: any) => {
    setFlowConfig(newConfig);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Fluxo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Processamento de Leads"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Um nome descritivo para este fluxo de trabalho
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Ativo</FormLabel>
                        <FormDescription>
                          Ative ou desative este fluxo de trabalho
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o propósito e funcionamento deste fluxo"
                        className="min-h-[100px]"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Uma descrição detalhada sobre o que este fluxo faz
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Network className="h-5 w-5 mr-2 text-primary" />
                Configuração do Fluxo
              </h3>
              
              <p className="text-muted-foreground mb-6">
                Configure as etapas e condições do seu fluxo de trabalho
              </p>
              
              <FlowEditor 
                initialConfig={flowConfig} 
                onChange={handleFlowConfigChange} 
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar Fluxo de Trabalho
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 