"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bot, Send, Loader2, User, AlertCircle, FileJson, FileSpreadsheet, Code } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Temporariamente definimos os tipos de parsers diretamente para não depender da importação
const OUTPUT_PARSERS = {
  TEXT: "text",
  JSON: "json", 
  CSV: "csv",
  CUSTOM: "custom"
} as const;

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  parsedContent?: any;
};

type Agent = {
  id: string;
  name: string;
  description: string;
  model: string;
  temperature: number;
  system_prompt: string;
  enabled: boolean;
  output_parser: string;
  agent_type: string;
  parent_agent_id: string | null;
  execution_order: number | null;
  condition: string | null;
};

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const agentId = searchParams.get("agent");
  const [agent, setAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Carregar detalhes do agente
  useEffect(() => {
    const fetchAgentDetails = async () => {
      if (!agentId) return;
      
      try {
        const supabase = createClient();
        
        // Verificar autenticação
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login?callbackUrl=/chat?agent=" + agentId);
          return;
        }
        
        // Buscar detalhes do agente
        const { data, error } = await supabase
          .from("agents")
          .select("*")
          .eq("id", agentId)
          .eq("user_id", user.id)
          .single();
          
        if (error) throw error;
        if (!data) {
          setError("Agente não encontrado ou você não tem permissão para acessá-lo.");
          return;
        }
        
        setAgent(data);
        
        // Adicionar mensagem inicial do assistente
        const welcomeMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Olá! Eu sou ${data.name}. Como posso ajudar você hoje?`,
          timestamp: new Date()
        };
        
        setMessages([welcomeMessage]);
      } catch (error) {
        console.error("Erro ao buscar detalhes do agente:", error);
        setError("Erro ao carregar o agente. Por favor, tente novamente.");
      }
    };
    
    fetchAgentDetails();
  }, [agentId, router]);
  
  // Rolar para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Função para extrair o formato correto da resposta com base no output_parser do agente
  const parseAgentResponse = (responseText: string, outputParser: string): any => {
    try {
      switch (outputParser) {
        case OUTPUT_PARSERS.JSON:
          return JSON.parse(responseText);
        case OUTPUT_PARSERS.CSV:
          // Dividir por linhas e depois por vírgulas para criar um array bidimensional
          const rows = responseText.split('\n').map(row => row.split(','));
          return rows;
        case OUTPUT_PARSERS.CUSTOM:
          // Em um ambiente real, esta função seria carregada dinamicamente do código armazenado
          // Para esta demonstração, apenas retornaremos o texto como está
          return { customParsed: responseText };
        case OUTPUT_PARSERS.TEXT:
        default:
          return responseText;
      }
    } catch (error) {
      console.error("Erro ao processar saída:", error);
      return responseText; // Em caso de erro, retornar o texto original
    }
  };
  
  // Renderizar conteúdo formatado
  const renderFormattedContent = (message: Message) => {
    if (message.role === "user") {
      return <div className="whitespace-pre-wrap">{message.content}</div>;
    }
    
    // Para mensagens do assistente
    if (!agent) return <div className="whitespace-pre-wrap">{message.content}</div>;
    
    switch (agent.output_parser) {
      case OUTPUT_PARSERS.JSON:
        try {
          const parsedJson = typeof message.parsedContent === 'object' 
            ? message.parsedContent 
            : JSON.parse(message.content);
            
          return (
            <pre className="text-xs overflow-auto max-h-[300px] p-2 bg-gray-100 dark:bg-gray-800 rounded">
              {JSON.stringify(parsedJson, null, 2)}
            </pre>
          );
        } catch (e) {
          return <div className="whitespace-pre-wrap">{message.content}</div>;
        }
      
      case OUTPUT_PARSERS.CSV:
        try {
          const rows = Array.isArray(message.parsedContent) 
            ? message.parsedContent 
            : message.content.split('\n').map(row => row.split(','));
            
          return (
            <div className="overflow-auto max-h-[300px]">
              <table className="w-full text-xs border-collapse">
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell: string, cellIndex: number) => (
                        <td key={cellIndex} className="border p-1 truncate">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        } catch (e) {
          return <div className="whitespace-pre-wrap">{message.content}</div>;
        }
      
      case OUTPUT_PARSERS.CUSTOM:
        // Para demonstração, apenas exibimos que é customizado
        return (
          <div>
            <div className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded p-1 mb-2 inline-block">
              Formatação Personalizada
            </div>
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
        );
      
      case OUTPUT_PARSERS.TEXT:
      default:
        return <div className="whitespace-pre-wrap">{message.content}</div>;
    }
  };
  
  // Simular resposta do agente (demonstração)
  const simulateAgentResponse = async (userMessage: string) => {
    if (!agent) return;
    
    setIsLoading(true);
    
    try {
      // Em um ambiente real, aqui seria feita uma chamada à API
      // para processar a mensagem através do modelo de IA escolhido
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Respostas predefinidas baseadas em palavras-chave para simulação
      let responseContent = "";
      
      if (userMessage.toLowerCase().includes("olá") || 
          userMessage.toLowerCase().includes("oi") || 
          userMessage.toLowerCase().includes("ei")) {
        responseContent = `Olá! Como posso ajudar você hoje?`;
      } else if (userMessage.toLowerCase().includes("preço") || 
                userMessage.toLowerCase().includes("valor") || 
                userMessage.toLowerCase().includes("custo")) {
        // Resposta de acordo com o formato de saída do agente
        if (agent.output_parser === OUTPUT_PARSERS.JSON) {
          responseContent = JSON.stringify({
            message: "Aqui estão informações sobre preços",
            products: [
              { name: "Produto A", price: 99.90, discount: "5%" },
              { name: "Produto B", price: 149.90, discount: "10%" },
              { name: "Produto C", price: 199.90, discount: "15%" }
            ]
          });
        } else if (agent.output_parser === OUTPUT_PARSERS.CSV) {
          responseContent = "Produto,Preço,Desconto\nProduto A,99.90,5%\nProduto B,149.90,10%\nProduto C,199.90,15%";
        } else {
          responseContent = `Os preços dos nossos produtos variam conforme as especificações. Posso ajudar você a encontrar opções dentro do seu orçamento. Qual produto específico você está interessado?`;
        }
      } else if (userMessage.toLowerCase().includes("entrega") || 
                userMessage.toLowerCase().includes("frete") || 
                userMessage.toLowerCase().includes("envio")) {
        // Resposta de acordo com o formato de saída do agente
        if (agent.output_parser === OUTPUT_PARSERS.JSON) {
          responseContent = JSON.stringify({
            message: "Informações de entrega",
            shipping: {
              methods: ["Express", "Normal", "Econômica"],
              times: ["1-2 dias", "3-5 dias", "7-15 dias"],
              prices: ["R$ 25,90", "R$ 15,90", "R$ 9,90"]
            }
          });
        } else if (agent.output_parser === OUTPUT_PARSERS.CSV) {
          responseContent = "Método,Tempo,Preço\nExpress,1-2 dias,R$ 25.90\nNormal,3-5 dias,R$ 15.90\nEconômica,7-15 dias,R$ 9.90";
        } else {
          responseContent = `Fazemos entregas para todo o Brasil. O prazo médio é de 3 a 5 dias úteis para capitais e 5 a 10 dias para outras localidades. O valor do frete é calculado com base no CEP de entrega.`;
        }
      } else {
        // Resposta padrão de acordo com o formato
        if (agent.output_parser === OUTPUT_PARSERS.JSON) {
          responseContent = JSON.stringify({
            message: "Resposta padrão",
            timestamp: new Date().toISOString(),
            topics: ["produtos", "preços", "entregas", "pagamentos"]
          });
        } else if (agent.output_parser === OUTPUT_PARSERS.CSV) {
          responseContent = "Tópico,Disponibilidade\nProdutos,Sim\nPreços,Sim\nEntregas,Sim\nPagamentos,Sim";
        } else {
          responseContent = `Obrigado por sua mensagem. Como assistente de e-commerce, posso ajudar com informações sobre produtos, preços, entregas, pagamentos e muito mais. Tem alguma dúvida específica?`;
        }
      }
      
      // Processar a resposta de acordo com o formato
      const parsedContent = parseAgentResponse(responseContent, agent.output_parser);
      
      const agentMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: responseContent,
        parsedContent: parsedContent,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      setError("Erro ao processar sua mensagem. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Enviar mensagem
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    // Adicionar mensagem do usuário
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    
    // Simular resposta do agente
    await simulateAgentResponse(userMessage.content);
  };
  
  // Lidar com tecla Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Ícone para o tipo de parser
  const getParserIcon = () => {
    if (!agent) return null;
    
    switch (agent.output_parser) {
      case OUTPUT_PARSERS.JSON:
        return <FileJson className="h-4 w-4" />;
      case OUTPUT_PARSERS.CSV:
        return <FileSpreadsheet className="h-4 w-4" />;
      case OUTPUT_PARSERS.CUSTOM:
        return <Code className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  // Se não houver agente selecionado
  if (!agentId) {
    return (
      <div className="container py-8 max-w-4xl mx-auto">
        <Card className="border-yellow-300/50 bg-yellow-50/50 dark:bg-yellow-900/10">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <AlertCircle className="h-6 w-6 text-yellow-500 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Nenhum agente selecionado</h3>
                <p className="text-muted-foreground mb-4">
                  Para iniciar uma conversa, selecione um agente da sua lista de agentes.
                </p>
                <Button asChild>
                  <Link href="/agents">Ver meus agentes</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container py-4 flex flex-col h-[calc(100vh-5rem)] max-w-4xl mx-auto">
      {/* Cabeçalho */}
      <div className="pb-4 mb-4 border-b">
        <div className="flex justify-between items-center">
          <Link href="/agents" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Agentes
          </Link>
          
          {agent && (
            <div className="flex items-center gap-2">
              <Badge variant={agent.enabled ? "default" : "secondary"}>
                {agent.enabled ? "Ativo" : "Inativo"}
              </Badge>
              <Badge variant="outline">
                {agent.model}
              </Badge>
              {agent.output_parser !== OUTPUT_PARSERS.TEXT && (
                <Badge variant="outline" className="flex items-center gap-1">
                  {getParserIcon()}
                  <span className="capitalize">{agent.output_parser}</span>
                </Badge>
              )}
            </div>
          )}
        </div>
        
        {agent && (
          <div className="mt-2">
            <h1 className="text-2xl font-bold flex items-center">
              <Bot className="h-5 w-5 mr-2" />
              {agent.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {agent.description}
            </p>
          </div>
        )}
        
        {/* Controles de exibição para formatos especiais */}
        {agent && agent.output_parser !== OUTPUT_PARSERS.TEXT && (
          <div className="mt-3 flex space-x-2">
            <Button 
              variant={!showRaw ? "default" : "outline"} 
              size="sm" 
              onClick={() => setShowRaw(false)}
              className="text-xs h-8"
            >
              Formatado
            </Button>
            <Button 
              variant={showRaw ? "default" : "outline"} 
              size="sm" 
              onClick={() => setShowRaw(true)}
              className="text-xs h-8"
            >
              Código Bruto
            </Button>
          </div>
        )}
      </div>
      
      {/* Área de mensagens */}
      {error ? (
        <Card className="border-destructive/50 bg-destructive/10 mb-4">
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted"
                }`}
              >
                <div className="flex items-center mb-1 text-xs opacity-70">
                  {message.role === "user" ? (
                    <>
                      <span>Você</span>
                      <User className="h-3 w-3 ml-1" />
                    </>
                  ) : (
                    <>
                      <Bot className="h-3 w-3 mr-1" />
                      <span>{agent?.name || "Assistente"}</span>
                    </>
                  )}
                </div>
                
                {message.role === "assistant" && agent?.output_parser !== OUTPUT_PARSERS.TEXT ? (
                  showRaw ? (
                    <pre className="text-xs overflow-auto max-h-[300px] whitespace-pre-wrap">
                      {message.content}
                    </pre>
                  ) : renderFormattedContent(message)
                ) : (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
                <div className="flex items-center mb-1 text-xs opacity-70">
                  <Bot className="h-3 w-3 mr-1" />
                  <span>{agent?.name || "Assistente"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Processando...</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Referência para rolar para o final */}
          <div ref={messagesEndRef} />
        </div>
      )}
      
      {/* Formulário de envio */}
      <div className="mt-auto pb-2">
        <div className="flex gap-2">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            className="resize-none flex-1"
            rows={1}
            disabled={isLoading || !!error}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || !!error}
            className="px-3"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            <span className="sr-only">Enviar</span>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Esta é uma demonstração. As respostas são simuladas para fins de teste.
        </p>
      </div>
    </div>
  );
} 