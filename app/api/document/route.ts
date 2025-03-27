import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUserFromServerComponent } from "@/lib/supabase/server";
import { AnalyticsService } from "@/lib/services/analytics-service";

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
    const {
      documentId,
      knowledgeBaseId,
      operationType,
      documentType = "text",
      content,
      agentId = null
    } = requestBody;

    if (!documentId || !knowledgeBaseId) {
      return new NextResponse(
        JSON.stringify({
          error: "ID do documento e ID da base de conhecimento são obrigatórios.",
        }),
        { status: 400 }
      );
    }

    if (!operationType || !["process", "upload", "delete", "update", "embed"].includes(operationType)) {
      return new NextResponse(
        JSON.stringify({ 
          error: "Tipo de operação inválido ou não fornecido. Use 'process', 'upload', 'delete', 'update' ou 'embed'." 
        }),
        { status: 400 }
      );
    }

    const supabase = createClient();
    
    // Verificar se o documento existe e pertence ao usuário
    const { data: document, error: documentError } = await supabase
      .from("documents")
      .select(`
        *,
        knowledge_base:knowledge_base_id (
          user_id
        )
      `)
      .eq("id", documentId)
      .single();

    if (documentError && documentError.code !== "PGRST116") {
      console.error("Erro ao buscar documento:", documentError);
      return new NextResponse(
        JSON.stringify({ error: "Erro ao buscar informações do documento." }),
        { status: 500 }
      );
    }

    // Se a operação for upload ou process, o documento pode não existir ainda
    if (operationType !== "upload" && operationType !== "process" && !document) {
      return new NextResponse(
        JSON.stringify({ error: "Documento não encontrado." }),
        { status: 404 }
      );
    }

    // Verificar permissão do usuário
    if (document && document.knowledge_base?.user_id !== user.id) {
      return new NextResponse(
        JSON.stringify({
          error: "Você não tem permissão para acessar este documento.",
        }),
        { status: 403 }
      );
    }

    // Se a operação for upload ou process, verificar se a base de conhecimento existe e pertence ao usuário
    if ((operationType === "upload" || operationType === "process") && !document) {
      const { data: kb, error: kbError } = await supabase
        .from("knowledge_base")
        .select("user_id")
        .eq("id", knowledgeBaseId)
        .single();

      if (kbError) {
        console.error("Erro ao buscar base de conhecimento:", kbError);
        return new NextResponse(
          JSON.stringify({ error: "Base de conhecimento não encontrada." }),
          { status: 404 }
        );
      }

      if (kb.user_id !== user.id) {
        return new NextResponse(
          JSON.stringify({
            error: "Você não tem permissão para acessar esta base de conhecimento.",
          }),
          { status: 403 }
        );
      }
    }

    // Iniciar tracking de performance
    const startTime = performance.now();
    let tokensProcessed = 0;
    let chunksCreated = 0;
    let status: "completed" | "error" = "completed";
    let errorMessage: string | undefined = undefined;

    try {
      // Simulação de processamento do documento
      // Na implementação real, aqui viria o código para processar o documento
      
      // Calcular número aproximado de tokens baseado no conteúdo
      if (content && typeof content === "string") {
        // Estimativa simples: cerca de 4 caracteres = 1 token
        tokensProcessed = Math.ceil(content.length / 4);
        
        // Estimativa de chunks: cerca de 1 chunk para cada 1000 tokens
        chunksCreated = Math.max(1, Math.ceil(tokensProcessed / 1000));
      }
      
      // Simulação de resposta
      const response = {
        success: true,
        document_id: documentId,
        knowledge_base_id: knowledgeBaseId,
        operation_type: operationType,
        tokens_processed: tokensProcessed,
        chunks_created: chunksCreated
      };
      
      // Registrar uso no analytics
      await AnalyticsService.trackDocumentUsage({
        user_id: user.id,
        document_id: documentId,
        knowledge_base_id: knowledgeBaseId,
        agent_id: agentId,
        operation_type: operationType,
        document_type: documentType,
        tokens_processed: tokensProcessed,
        chunks_created: chunksCreated,
        processing_time_ms: Math.round(performance.now() - startTime),
        status: status
      });
      
      return NextResponse.json(response);
    } catch (error) {
      console.error(`Erro ao ${operationType} documento:`, error);
      
      // Atualizar status para erro
      status = "error";
      errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      
      // Registrar uso com erro no analytics
      await AnalyticsService.trackDocumentUsage({
        user_id: user.id,
        document_id: documentId,
        knowledge_base_id: knowledgeBaseId,
        agent_id: agentId,
        operation_type: operationType,
        document_type: documentType,
        tokens_processed: tokensProcessed,
        chunks_created: chunksCreated,
        processing_time_ms: Math.round(performance.now() - startTime),
        status: status,
        error: errorMessage
      });
      
      return new NextResponse(
        JSON.stringify({
          error: `Erro ao ${operationType} o documento. Tente novamente mais tarde.`,
          details: errorMessage,
        }),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erro geral na rota /api/document:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Ocorreu um erro ao processar sua solicitação.",
      }),
      { status: 500 }
    );
  }
} 