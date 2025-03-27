import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUserFromServerComponent } from "@/lib/supabase/server";
import { AnalyticsService } from "@/lib/services/analytics-service";

// Em vez de importar AgentRuntime que não existe, vamos simular a resposta
interface AgentResponse {
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
  };
  model?: string;
}

// Definição do tipo para tracking de uso
interface AgentUsageTrackingData {
  user_id: string;
  agent_id: string;
  chat_id: string | null;
  input_tokens: number;
  output_tokens: number;
  prompt_tokens: number;
  total_tokens: number;
  model: string;
  duration_ms: number;
  status: "completed" | "error";
  error?: string; // Campo opcional para compatibilidade
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUserFromServerComponent();

    if (!user) {
      return new NextResponse(
        JSON.stringify({
          error: "Não autorizado. Faça login para continuar.",
        }),
        { status: 401 }
      );
    }

    const requestBody = await req.json();
    const { agentId, messages, conversationId } = requestBody;

    if (!agentId) {
      return new NextResponse(
        JSON.stringify({ error: "ID do agente não fornecido." }),
        { status: 400 }
      );
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new NextResponse(
        JSON.stringify({ error: "Mensagens inválidas ou não fornecidas." }),
        { status: 400 }
      );
    }

    const supabase = createClient();
    
    // Buscar informações do agente
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("*")
      .eq("id", agentId)
      .single();

    if (agentError || !agent) {
      return new NextResponse(
        JSON.stringify({ error: "Agente não encontrado." }),
        { status: 404 }
      );
    }

    // Verificar se o agente pertence ao usuário
    if (agent.user_id !== user.id) {
      return new NextResponse(
        JSON.stringify({
          error: "Você não tem permissão para acessar este agente.",
        }),
        { status: 403 }
      );
    }

    // Iniciar tracking de performance
    const startTime = performance.now();
    let inputTokens = 0;
    let outputTokens = 0;
    let status: "completed" | "error" = "completed";
    let errorMessage: string | undefined = undefined;

    try {
      // Esta parte dependeria da implementação real do AgentRuntime
      // Simulando uma resposta para exemplo
      const response: AgentResponse = {
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50
        },
        model: agent.model || "unknown"
      };
      
      // Atualizar contadores de tokens
      inputTokens = response.usage?.prompt_tokens || 0;
      outputTokens = response.usage?.completion_tokens || 0;
      
      // Registrar uso no analytics
      await AnalyticsService.trackAgentUsage({
        user_id: user.id,
        agent_id: agentId,
        chat_id: conversationId || null,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        prompt_tokens: inputTokens,
        total_tokens: inputTokens + outputTokens,
        model: response.model || agent.model,
        duration_ms: Math.round(performance.now() - startTime),
        status: status,
        // O campo error é opcional e pode ser omitido
      });
      
      return NextResponse.json(response);
    } catch (error) {
      console.error("Erro ao processar mensagem do agente:", error);
      
      // Atualizar status para erro
      status = "error";
      errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      
      // Registrar uso com erro no analytics
      await AnalyticsService.trackAgentUsage({
        user_id: user.id,
        agent_id: agentId,
        chat_id: conversationId || null,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        prompt_tokens: inputTokens,
        total_tokens: inputTokens + outputTokens,
        model: agent.model,
        duration_ms: Math.round(performance.now() - startTime),
        status: status,
        error: errorMessage,
      });
      
      return new NextResponse(
        JSON.stringify({
          error: "Erro ao processar a mensagem. Tente novamente mais tarde.",
          details: errorMessage,
        }),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erro geral na rota /api/agent:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Ocorreu um erro ao processar sua solicitação.",
      }),
      { status: 500 }
    );
  }
} 