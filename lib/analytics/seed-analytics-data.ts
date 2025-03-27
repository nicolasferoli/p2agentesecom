import { createClient } from '@/lib/supabase/client';
import { Database } from '@/shared/types/database.types';

type AgentUsageInsert = Database['public']['Tables']['agent_usage']['Insert'];
type DocumentUsageInsert = Database['public']['Tables']['document_usage']['Insert'];
type PerformanceMetricInsert = Database['public']['Tables']['performance_metrics']['Insert'];
type ActivityLogInsert = Database['public']['Tables']['activity_logs']['Insert'];
type Json = any; // Simplificando para qualquer tipo de objeto JSON

/**
 * Função para popular as tabelas de analytics com dados de exemplo
 * @param userId ID do usuário para o qual serão gerados os dados
 * @param agentIds Array de IDs dos agentes que serão usados nos dados
 * @param documentIds Array de IDs dos documentos que serão usados nos dados
 */
export async function seedAnalyticsData(
  userId: string, 
  agentIds: string[], 
  documentIds: string[]
) {
  const supabase = createClient();
  
  // Verificar se já existem dados para este usuário
  const { data: existingData, error: checkError } = await supabase
    .from('agent_usage')
    .select('id')
    .eq('user_id', userId)
    .limit(1);
    
  if (checkError) {
    console.error('Erro ao verificar dados existentes:', checkError);
    return { success: false, error: checkError };
  }
  
  // Se já existem dados, não fazer nada
  if (existingData && existingData.length > 0) {
    return { success: true, message: 'Dados já existem para este usuário' };
  }
  
  try {
    // Dados para agent_usage
    const agentUsageData: AgentUsageInsert[] = [];
    
    // Gerar dados para os últimos 30 dias
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Para cada dia, gerar entre 5-15 consultas aleatórias
      const dailyQueryCount = Math.floor(Math.random() * 10) + 5;
      
      for (let j = 0; j < dailyQueryCount; j++) {
        // Escolher um agente aleatório
        const agentId = agentIds[Math.floor(Math.random() * agentIds.length)];
        
        // Gerar uma consulta exemplo
        const queries = [
          "Qual o preço do produto X?",
          "Como funciona a entrega para minha região?",
          "Posso trocar o produto se não gostar?",
          "Qual a garantia deste produto?",
          "Vocês têm desconto para compras em quantidade?",
          "Como rastrear meu pedido?",
          "Quanto tempo leva para o produto chegar?",
          "Vocês entregam no exterior?",
          "Quais são as formas de pagamento?",
          "O produto X está disponível em outras cores?"
        ];
        const query = queries[Math.floor(Math.random() * queries.length)];
        
        // Gerar tokens e tempos aleatórios
        const inputTokens = Math.floor(Math.random() * 500) + 50;
        const outputTokens = Math.floor(Math.random() * 500) + 50;
        const promptTokens = Math.floor(Math.random() * 200) + 100;
        const totalTokens = inputTokens + outputTokens + promptTokens;
        const responseTime = Math.floor(Math.random() * 2000) + 200;
        const success = Math.random() > 0.1; // 90% de sucesso
        
        // Ajustar a data e hora
        const timestamp = new Date(date);
        timestamp.setHours(Math.floor(Math.random() * 24));
        timestamp.setMinutes(Math.floor(Math.random() * 60));
        
        const metadata: Json = {
          query_text: query,
          user_feedback: Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : null
        };
        
        agentUsageData.push({
          user_id: userId,
          agent_id: agentId,
          chat_id: null,
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          prompt_tokens: promptTokens,
          total_tokens: totalTokens,
          model: ['gpt-3.5-turbo', 'gpt-4', 'claude-2'][Math.floor(Math.random() * 3)],
          duration_ms: responseTime,
          status: success ? 'completed' : 'error',
          error: success ? null : 'Failed to generate response',
          metadata,
          created_at: timestamp.toISOString()
        });
      }
    }
    
    // Inserir dados de uso de agentes
    if (agentUsageData.length > 0) {
      const { error: agentUsageError } = await supabase
        .from('agent_usage')
        .insert(agentUsageData);
        
      if (agentUsageError) {
        console.error('Erro ao inserir dados de uso de agentes:', agentUsageError);
      }
    }
    
    // Dados para document_usage
    const documentUsageData: DocumentUsageInsert[] = [];
    
    // Tipos de documentos
    const documentTypes = ['pdf', 'txt', 'docx', 'csv', 'html'];
    const operationTypes = ['upload', 'process', 'embed', 'retrieve', 'update', 'delete'];
    
    // Gerar dados de uso de documentos
    for (let i = 0; i < 50; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      // Escolher um documento aleatório
      const documentId = documentIds[Math.floor(Math.random() * documentIds.length)];
      
      // 70% de chance de associar a um agente
      const useAgent = Math.random() > 0.3;
      const agentId = useAgent ? agentIds[Math.floor(Math.random() * agentIds.length)] : null;
      
      // Número de recuperações
      const retrievalCount = Math.floor(Math.random() * 5) + 1;
      const tokensProcessed = Math.floor(Math.random() * 10000) + 500;
      const chunksCreated = Math.floor(Math.random() * 20) + 1;
      const processingTime = Math.floor(Math.random() * 5000) + 200;
      
      // Conhecemos o ID das bases de conhecimento?
      const knowledgeBaseId = "00000000-0000-0000-0000-000000000000"; // ID de exemplo, substitua por real
      
      documentUsageData.push({
        user_id: userId,
        document_id: documentId,
        knowledge_base_id: knowledgeBaseId,
        agent_id: agentId,
        operation_type: operationTypes[Math.floor(Math.random() * operationTypes.length)],
        document_type: documentTypes[Math.floor(Math.random() * documentTypes.length)],
        tokens_processed: tokensProcessed,
        chunks_created: chunksCreated,
        processing_time_ms: processingTime,
        status: 'completed',
        created_at: date.toISOString()
      });
    }
    
    // Inserir dados de uso de documentos
    if (documentUsageData.length > 0) {
      const { error: documentUsageError } = await supabase
        .from('document_usage')
        .insert(documentUsageData);
        
      if (documentUsageError) {
        console.error('Erro ao inserir dados de uso de documentos:', documentUsageError);
      }
    }
    
    // Dados para performance_metrics
    const performanceMetricData: PerformanceMetricInsert[] = [];
    
    // Métricas possíveis
    const resourceTypes = ['agent', 'document', 'chat', 'workflow', 'prompt'];
    const operations = ['create', 'update', 'process', 'generate', 'query'];
    
    // Gerar dados de métricas de desempenho
    for (let i = 0; i < agentIds.length; i++) {
      for (let j = 0; j < 4; j++) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        
        // Tempos
        const startTime = new Date(date);
        const endTime = new Date(startTime);
        endTime.setSeconds(endTime.getSeconds() + Math.floor(Math.random() * 60) + 5);
        const durationMs = endTime.getTime() - startTime.getTime();
        
        // Métricas
        const cpuUsage = Math.random() * 0.5;
        const memoryUsage = Math.random() * 0.7;
        const success = Math.random() > 0.05; // 95% de sucesso
        
        performanceMetricData.push({
          user_id: userId,
          resource_type: resourceTypes[Math.floor(Math.random() * resourceTypes.length)],
          resource_id: agentIds[i],
          operation: operations[Math.floor(Math.random() * operations.length)],
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          duration_ms: durationMs,
          cpu_usage: cpuUsage,
          memory_usage: memoryUsage,
          success,
          error: success ? null : 'Resource timeout',
          created_at: date.toISOString()
        });
      }
    }
    
    // Inserir dados de métricas de desempenho
    if (performanceMetricData.length > 0) {
      const { error: performanceMetricError } = await supabase
        .from('performance_metrics')
        .insert(performanceMetricData);
        
      if (performanceMetricError) {
        console.error('Erro ao inserir dados de métricas de desempenho:', performanceMetricError);
      }
    }
    
    // Dados para activity_logs
    const activityLogData: ActivityLogInsert[] = [];
    
    // Tipos de atividades
    const actions = [
      'login', 
      'create_agent', 
      'edit_agent', 
      'upload_document', 
      'create_knowledge_base',
      'start_chat_session'
    ];
    
    // Gerar logs de atividade
    for (let i = 0; i < 40; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      // Escolher um tipo de atividade aleatório
      const actionType = actions[Math.floor(Math.random() * actions.length)];
      
      // Definir o tipo de entidade e ID da entidade com base na ação
      let entityType: string | null = null;
      let entityId: string | null = null;
      
      switch (actionType) {
        case 'create_agent':
        case 'edit_agent':
          entityType = 'agent';
          entityId = agentIds[Math.floor(Math.random() * agentIds.length)];
          break;
        case 'upload_document':
          entityType = 'document';
          entityId = documentIds[Math.floor(Math.random() * documentIds.length)];
          break;
        case 'create_knowledge_base':
          entityType = 'knowledge_base';
          entityId = "00000000-0000-0000-0000-000000000000"; // Substitua por ID real
          break;
        case 'start_chat_session':
          entityType = 'chat';
          entityId = "00000000-0000-0000-0000-000000000000"; // Substitua por ID real
          break;
      }
      
      // Gerar detalhes fictícios
      const details: Json = {};
      
      switch (actionType) {
        case 'login':
          details.success = true;
          details.device = ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)];
          details.browser = ['Chrome', 'Firefox', 'Safari'][Math.floor(Math.random() * 3)];
          break;
        case 'create_agent':
        case 'edit_agent':
          details.agent_type = ['standard', 'multi', 'conditional'][Math.floor(Math.random() * 3)];
          details.model = ['gpt-3.5-turbo', 'gpt-4', 'claude-2'][Math.floor(Math.random() * 3)];
          break;
        case 'upload_document':
          details.file_size = Math.floor(Math.random() * 1000000) + 10000;
          details.file_type = documentTypes[Math.floor(Math.random() * documentTypes.length)];
          break;
        case 'create_knowledge_base':
          details.name = `Base de Conhecimento ${Math.floor(Math.random() * 10) + 1}`;
          details.document_count = Math.floor(Math.random() * 20) + 1;
          break;
        case 'start_chat_session':
          details.message_count = Math.floor(Math.random() * 20) + 1;
          details.duration_seconds = Math.floor(Math.random() * 1800) + 60;
          break;
      }
      
      activityLogData.push({
        user_id: userId,
        session_id: `session-${Math.floor(Math.random() * 100000)}`,
        action: actionType,
        entity_type: entityType,
        entity_id: entityId,
        ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        user_agent: `Mozilla/5.0 (${['Windows', 'Macintosh', 'Linux'][Math.floor(Math.random() * 3)]})`,
        details,
        created_at: date.toISOString()
      });
    }
    
    // Inserir logs de atividade
    if (activityLogData.length > 0) {
      const { error: activityLogError } = await supabase
        .from('activity_logs')
        .insert(activityLogData);
        
      if (activityLogError) {
        console.error('Erro ao inserir logs de atividade:', activityLogError);
      }
    }
    
    return { 
      success: true, 
      message: 'Dados de exemplo inseridos com sucesso',
      counts: {
        agent_usage: agentUsageData.length,
        document_usage: documentUsageData.length,
        performance_metrics: performanceMetricData.length,
        activity_logs: activityLogData.length
      }
    };
    
  } catch (error) {
    console.error('Erro ao inserir dados de exemplo:', error);
    return { success: false, error };
  }
} 