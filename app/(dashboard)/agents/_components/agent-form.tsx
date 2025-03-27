"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Bot, Loader2, ChevronDown, ChevronRight } from "lucide-react";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { AGENT_TYPE, OUTPUT_PARSERS } from "@/shared/types/supabase";

// Schema de validação do formulário
const formSchema = z.object({
  name: z.string()
    .min(3, { message: "O nome deve ter pelo menos 3 caracteres" })
    .max(50, { message: "O nome não pode ter mais de 50 caracteres" }),
  description: z.string()
    .min(10, { message: "A descrição deve ter pelo menos 10 caracteres" })
    .max(500, { message: "A descrição não pode ter mais de 500 caracteres" }),
  model: z.string(),
  temperature: z.number()
    .min(0, { message: "A temperatura mínima é 0" })
    .max(1, { message: "A temperatura máxima é 1" }),
  system_prompt: z.string()
    .min(10, { message: "O prompt do sistema deve ter pelo menos 10 caracteres" }),
  enabled: z.boolean().default(true),
  output_parser: z.string().default(OUTPUT_PARSERS.TEXT),
  agent_type: z.string().default(AGENT_TYPE.SIMPLE),
  parent_agent_id: z.string().optional().nullable(),
  execution_order: z.number().optional().nullable(),
  condition: z.string().optional().nullable(),
  custom_parser_code: z.string().optional().nullable(),
});

// Tipo do formulário
type FormValues = z.infer<typeof formSchema>;

interface AgentFormProps {
  initialData?: FormValues;
  userId: string;
  agentId?: string;
  availableAgents?: Array<{id: string, name: string}>;
}

export function AgentForm({
  initialData = {
    name: "",
    description: "",
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    system_prompt: "Você é um assistente útil e amigável.",
    enabled: true,
    output_parser: OUTPUT_PARSERS.TEXT,
    agent_type: AGENT_TYPE.SIMPLE,
    parent_agent_id: null,
    execution_order: null,
    condition: null,
    custom_parser_code: null
  },
  userId,
  agentId,
  availableAgents = []
}: AgentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showCustomParser, setShowCustomParser] = useState(false);
  const supabase = createClient();

  // Inicializar formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  // Monitorar quando o Output Parser for alterado para CUSTOM
  useEffect(() => {
    if (form.watch("output_parser") === OUTPUT_PARSERS.CUSTOM) {
      setShowCustomParser(true);
    } else {
      setShowCustomParser(false);
    }
  }, [form]);

  // Função para enviar o formulário
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Remover campos que não se aplicam ao tipo de agente
      let dataToSave = { ...values };
      
      // Converter o valor "none" para null no parent_agent_id
      if (dataToSave.parent_agent_id === "none") {
        dataToSave.parent_agent_id = null;
      }
      
      if (values.agent_type === AGENT_TYPE.SIMPLE) {
        dataToSave.parent_agent_id = null;
        dataToSave.execution_order = null;
        dataToSave.condition = null;
      } else if (values.agent_type === AGENT_TYPE.MULTI) {
        dataToSave.execution_order = null;
        dataToSave.condition = null;
      } else if (values.agent_type === AGENT_TYPE.SEQUENTIAL) {
        dataToSave.condition = null;
      }
      
      // Remover o código custom parser se não for usado
      if (values.output_parser !== OUTPUT_PARSERS.CUSTOM) {
        dataToSave.custom_parser_code = null;
      }
      
      // Determinar se é uma criação ou atualização
      if (agentId) {
        // Atualizar agente existente
        const { error } = await supabase
          .from("agents")
          .update({
            ...dataToSave,
            updated_at: new Date().toISOString(),
          })
          .eq("id", agentId);

        if (error) throw error;
      } else {
        // Criar novo agente
        const { error } = await supabase
          .from("agents")
          .insert({
            ...dataToSave,
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;
      }

      // Redirecionar para a lista de agentes
      router.push("/agents");
      router.refresh();
    } catch (error) {
      console.error("Erro ao salvar agente:", error);
      alert("Ocorreu um erro ao salvar o agente. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Obter o tipo de agente atual
  const agentType = form.watch("agent_type");
  const outputParser = form.watch("output_parser");

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nome do Agente */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Agente</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Assistente de Vendas" {...field} />
                    </FormControl>
                    <FormDescription>
                      Nome do seu assistente virtual
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Modelo de IA */}
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo de IA</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um modelo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                        <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                        <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                        <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Modelo utilizado para gerar respostas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Descrição do Agente */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o propósito deste agente..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Uma descrição detalhada do que seu agente faz
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Prompt do Sistema */}
            <FormField
              control={form.control}
              name="system_prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt do Sistema</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Instruções para o comportamento do agente..."
                      className="resize-none"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Instruções que definem o comportamento e conhecimentos do agente
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Temperatura */}
              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperatura: {field.value}</FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={1}
                        step={0.1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="pb-6"
                      />
                    </FormControl>
                    <FormDescription>
                      Controla a aleatoriedade das respostas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status do Agente */}
              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <FormLabel>Status do Agente</FormLabel>
                      <FormDescription>
                        Ativar ou desativar este agente
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Seção de Configuração de Saída */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Configuração de Saída</h3>
              </div>
              
              <FormField
                control={form.control}
                name="output_parser"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Formato de Saída</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um formato" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={OUTPUT_PARSERS.TEXT}>Texto</SelectItem>
                        <SelectItem value={OUTPUT_PARSERS.JSON}>JSON</SelectItem>
                        <SelectItem value={OUTPUT_PARSERS.CSV}>CSV</SelectItem>
                        <SelectItem value={OUTPUT_PARSERS.CUSTOM}>Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Define como as respostas serão formatadas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {showCustomParser && (
                <FormField
                  control={form.control}
                  name="custom_parser_code"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Código do Parser Personalizado</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="function parseResponse(text) { ... }"
                          className="font-mono h-48 resize-none"
                          {...field}
                          value={field.value || "// Função para processar a saída do modelo\nfunction parseOutput(text) {\n  // Implementação personalizada\n  return {\n    processed: true,\n    text: text\n  };\n}"}
                        />
                      </FormControl>
                      <FormDescription>
                        Código JavaScript para processar a resposta do modelo
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Opções Avançadas */}
            <div>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              >
                <span>Opções Avançadas</span>
                {showAdvancedOptions ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
              
              {showAdvancedOptions && (
                <div className="mt-4 space-y-4">
                  {/* Tipo de Agente */}
                  <FormField
                    control={form.control}
                    name="agent_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Agente</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo de agente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={AGENT_TYPE.SIMPLE}>Padrão</SelectItem>
                            <SelectItem value={AGENT_TYPE.MULTI}>Multi-agente</SelectItem>
                            <SelectItem value={AGENT_TYPE.SEQUENTIAL}>Sequencial</SelectItem>
                            <SelectItem value={AGENT_TYPE.CONDITIONAL}>Condicional</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Define como o agente opera e interage com outros agentes
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Campos específicos para agentes Multi, Sequenciais e Condicionais */}
                  {agentType !== AGENT_TYPE.SIMPLE && (
                    <div className="border p-4 rounded-lg mt-4 space-y-4">
                      <div className="font-medium">
                        Configuração de {agentType === AGENT_TYPE.MULTI ? "Multi-agente" : agentType === AGENT_TYPE.SEQUENTIAL ? "Agente Sequencial" : "Agente Condicional"}
                      </div>
                      <div className="space-y-4">
                        {/* Agente pai para Multi, Sequencial e Condicional */}
                        <FormField
                          control={form.control}
                          name="parent_agent_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Agente Principal</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value || "none"}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o agente principal" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="none">Nenhum (Este é o agente principal)</SelectItem>
                                  {availableAgents.map(agent => (
                                    <SelectItem key={agent.id} value={agent.id}>
                                      {agent.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                {agentType === AGENT_TYPE.MULTI 
                                  ? "Selecione o agente principal para este subagente"
                                  : agentType === AGENT_TYPE.SEQUENTIAL
                                  ? "Selecione o agente principal desta sequência"
                                  : "Selecione o agente principal para esta condição"}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Ordem de execução para agentes sequenciais */}
                        {agentType === AGENT_TYPE.SEQUENTIAL && (
                          <FormField
                            control={form.control}
                            name="execution_order"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ordem de Execução</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min="1"
                                    placeholder="Exemplo: 1, 2, 3..." 
                                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Define a ordem em que este agente será executado na sequência
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {/* Condição para agentes condicionais */}
                        {agentType === AGENT_TYPE.CONDITIONAL && (
                          <FormField
                            control={form.control}
                            name="condition"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Condição</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Exemplo: message.includes('produto') || intent === 'compra'"
                                    className="font-mono text-sm"
                                    rows={3}
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(e.target.value)}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Expressão JavaScript que determina quando este agente será acionado.
                                  Você pode usar:
                                  <ul className="list-disc pl-5 mt-1 space-y-1">
                                    <li>message: o texto da mensagem enviada</li>
                                    <li>intent: a intenção detectada (se disponível)</li>
                                    <li>entities: entidades extraídas (se disponíveis)</li>
                                  </ul>
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Bot className="mr-2 h-4 w-4" />
                    {agentId ? "Atualizar Agente" : "Criar Agente"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 