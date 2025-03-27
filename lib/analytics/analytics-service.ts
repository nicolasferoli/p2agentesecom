import { createClient } from '@/lib/supabase/client';
import { 
  AgentUsageInsert, 
  DocumentUsageInsert, 
  PerformanceMetricInsert, 
  ActivityLogInsert 
} from '@/shared/types/supabase';

/**
 * Serviço para rastrear atividades e métricas da aplicação
 */
export class AnalyticsService {
  private supabase = createClient();
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Registra uma consulta a um agente
   */
  async trackAgentQuery(agentId: string, query: string, tokensUsed: number, responseTime: number, success: boolean = true): Promise<void> {
    try {
      // Dividindo tokens aleatoriamente para compatibilidade com o esquema
      const inputTokens = Math.floor(tokensUsed * 0.3);
      const outputTokens = Math.floor(tokensUsed * 0.5);
      const promptTokens = tokensUsed - inputTokens - outputTokens;
      
      const agentUsage: AgentUsageInsert = {
        user_id: this.userId,
        agent_id: agentId,
        chat_id: null,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        prompt_tokens: promptTokens,
        total_tokens: tokensUsed,
        model: 'gpt-3.5-turbo', // Valor padrão
        duration_ms: responseTime,
        status: success ? 'completed' : 'error',
        metadata: { query_text: query }
      };

      const { error } = await this.supabase
        .from('agent_usage')
        .insert(agentUsage);

      if (error) {
        console.error('Erro ao registrar uso do agente:', error);
      }
    } catch (error) {
      console.error('Falha ao registrar uso do agente:', error);
    }
  }

  /**
   * Registra o uso de um documento
   */
  async trackDocumentRetrieval(documentId: string, agentId?: string, retrievalCount: number = 1): Promise<void> {
    try {
      const documentUsage: DocumentUsageInsert = {
        user_id: this.userId,
        document_id: documentId,
        knowledge_base_id: '00000000-0000-0000-0000-000000000000', // Valor padrão, substituir pelo real
        agent_id: agentId || null,
        operation_type: 'retrieve',
        document_type: 'pdf', // Valor padrão, substituir pelo tipo real se disponível
        tokens_processed: retrievalCount * 100, // Valor estimado
        chunks_created: 1,
        processing_time_ms: 500 // Valor padrão
      };

      const { error } = await this.supabase
        .from('document_usage')
        .insert(documentUsage);

      if (error) {
        console.error('Erro ao registrar uso do documento:', error);
      }
    } catch (error) {
      console.error('Falha ao registrar uso do documento:', error);
    }
  }

  /**
   * Registra uma métrica de desempenho
   */
  async trackPerformanceMetric(metricType: string, metricValue: number, agentId?: string): Promise<void> {
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() - 1000); // 1 segundo antes
      
      const performanceMetric: PerformanceMetricInsert = {
        user_id: this.userId,
        resource_type: 'agent', // Tipo de recurso padrão
        resource_id: agentId || '00000000-0000-0000-0000-000000000000',
        operation: metricType,
        start_time: startTime.toISOString(),
        end_time: now.toISOString(),
        duration_ms: 1000, // 1 segundo padrão
        success: metricValue > 0.5,
        cpu_usage: metricValue,
        memory_usage: metricValue * 0.8
      };

      const { error } = await this.supabase
        .from('performance_metrics')
        .insert(performanceMetric);

      if (error) {
        console.error('Erro ao registrar métrica de desempenho:', error);
      }
    } catch (error) {
      console.error('Falha ao registrar métrica de desempenho:', error);
    }
  }

  /**
   * Registra uma atividade do usuário
   */
  async trackActivity(activityType: string, details: any = {}, ipAddress?: string): Promise<void> {
    try {
      const activityLog: ActivityLogInsert = {
        user_id: this.userId,
        session_id: `session-${Date.now()}`,
        action: activityType, // Usando o campo action em vez de activity_type
        entity_type: details.entity_type || null,
        entity_id: details.entity_id || null,
        ip_address: ipAddress || null,
        user_agent: details.user_agent || navigator.userAgent || null,
        details: details
      };

      const { error } = await this.supabase
        .from('activity_logs')
        .insert(activityLog);

      if (error) {
        console.error('Erro ao registrar atividade:', error);
      }
    } catch (error) {
      console.error('Falha ao registrar atividade:', error);
    }
  }

  /**
   * Recupera estatísticas de uso de agentes para o usuário atual
   */
  async getAgentUsageStats(startDate?: Date, endDate?: Date) {
    try {
      console.log('Iniciando consulta de estatísticas de agentes para usuário:', this.userId);
      
      if (!this.userId) {
        console.warn('UserId não definido para consulta de agentes');
        return [];
      }
      
      let query = this.supabase
        .from('agent_usage')
        .select('*')
        .eq('user_id', this.userId);

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      console.log('Executando consulta de estatísticas de agentes...');
      const { data, error } = await query;
      
      if (error) {
        console.error('Erro na consulta do Supabase (agent_usage):', JSON.stringify(error));
        throw new Error(`Erro ao consultar estatísticas de agentes: ${error.message || 'Erro desconhecido'}`);
      }
      
      console.log(`Dados recuperados para agent_usage: ${data?.length || 0} registros`);
      return data || [];
    } catch (error) {
      console.error('Erro detalhado ao recuperar estatísticas de uso do agente:', error);
      
      // Se não for um erro do Supabase, tratar genericamente
      if (typeof error === 'object' && error !== null) {
        console.error('Detalhes do erro:', JSON.stringify(error));
      }
      
      throw error;
    }
  }

  /**
   * Recupera estatísticas de uso de documentos para o usuário atual
   */
  async getDocumentUsageStats(startDate?: Date, endDate?: Date) {
    try {
      console.log('Iniciando consulta de estatísticas de documentos para usuário:', this.userId);
      
      if (!this.userId) {
        console.warn('UserId não definido para consulta de documentos');
        return [];
      }
      
      let query = this.supabase
        .from('document_usage')
        .select('*')
        .eq('user_id', this.userId);

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      console.log('Executando consulta de estatísticas de documentos...');
      const { data, error } = await query;
      
      if (error) {
        console.error('Erro na consulta do Supabase (document_usage):', JSON.stringify(error));
        throw new Error(`Erro ao consultar estatísticas de documentos: ${error.message || 'Erro desconhecido'}`);
      }
      
      console.log(`Dados recuperados para document_usage: ${data?.length || 0} registros`);
      return data || [];
    } catch (error) {
      console.error('Erro detalhado ao recuperar estatísticas de uso do documento:', error);
      
      // Se não for um erro do Supabase, tratar genericamente
      if (typeof error === 'object' && error !== null) {
        console.error('Detalhes do erro:', JSON.stringify(error));
      }
      
      throw error;
    }
  }

  /**
   * Recupera logs de atividade para o usuário atual
   */
  async getActivityLogs(startDate?: Date, endDate?: Date, limit: number = 50) {
    try {
      console.log('Iniciando consulta de logs de atividade para usuário:', this.userId);
      
      if (!this.userId) {
        console.warn('UserId não definido para consulta de logs');
        return [];
      }
      
      let query = this.supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      console.log('Executando consulta de logs de atividade...');
      const { data, error } = await query;
      
      if (error) {
        console.error('Erro na consulta do Supabase (activity_logs):', JSON.stringify(error));
        throw new Error(`Erro ao consultar logs de atividade: ${error.message || 'Erro desconhecido'}`);
      }
      
      console.log(`Dados recuperados para activity_logs: ${data?.length || 0} registros`);
      return data || [];
    } catch (error) {
      console.error('Erro detalhado ao recuperar logs de atividade:', error);
      
      // Se não for um erro do Supabase, tratar genericamente
      if (typeof error === 'object' && error !== null) {
        console.error('Detalhes do erro:', JSON.stringify(error));
      }
      
      throw error;
    }
  }
} 