import { createClient } from '@/lib/supabase/client';
import { createClient as createServerClient } from '@/lib/supabase/server';

export type AgentUsageData = {
  user_id: string;
  agent_id: string;
  chat_id?: string;
  input_tokens: number;
  output_tokens: number;
  prompt_tokens: number;
  total_tokens: number;
  model: string;
  duration_ms: number;
  status: 'completed' | 'error';
  error?: string;
  metadata?: Record<string, any>;
};

export type DocumentUsageData = {
  user_id: string;
  document_id: string;
  knowledge_base_id: string;
  agent_id?: string;
  operation_type: 'upload' | 'process' | 'embed' | 'retrieve' | 'update' | 'delete';
  document_type: string;
  tokens_processed: number;
  chunks_created: number;
  processing_time_ms: number;
  status: 'completed' | 'error';
  error?: string;
  metadata?: Record<string, any>;
};

export type PerformanceMetricData = {
  user_id: string;
  resource_type: 'agent' | 'document' | 'chat' | 'workflow' | 'prompt';
  resource_id: string;
  operation: string;
  start_time: Date;
  end_time: Date;
  duration_ms: number;
  cpu_usage?: number;
  memory_usage?: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
};

export type ActivityLogData = {
  user_id: string;
  session_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, any>;
};

/**
 * Serviço para registrar métricas e logs de uso
 */
export class AnalyticsService {
  /**
   * Registra o uso de um agente
   */
  static async trackAgentUsage(data: AgentUsageData) {
    try {
      // Calcular o total_tokens se não fornecido
      const total_tokens = data.total_tokens || 
        (data.input_tokens + data.output_tokens + data.prompt_tokens);
      
      const client = createClient();
      const { error } = await client
        .from('agent_usage')
        .insert({
          ...data,
          total_tokens,
        });

      if (error) {
        console.error('Erro ao registrar uso do agente:', error);
      }
    } catch (error) {
      console.error('Exceção ao registrar uso do agente:', error);
    }
  }

  /**
   * Registra o uso de um documento
   */
  static async trackDocumentUsage(data: DocumentUsageData) {
    try {
      const client = createClient();
      const { error } = await client
        .from('document_usage')
        .insert(data);

      if (error) {
        console.error('Erro ao registrar uso do documento:', error);
      }
    } catch (error) {
      console.error('Exceção ao registrar uso do documento:', error);
    }
  }

  /**
   * Registra uma métrica de desempenho
   */
  static async trackPerformanceMetric(data: PerformanceMetricData) {
    try {
      // Calcular a duração se não fornecida
      const duration_ms = data.duration_ms || 
        (data.end_time.getTime() - data.start_time.getTime());
      
      const client = createClient();
      const { error } = await client
        .from('performance_metrics')
        .insert({
          ...data,
          duration_ms,
        });

      if (error) {
        console.error('Erro ao registrar métrica de desempenho:', error);
      }
    } catch (error) {
      console.error('Exceção ao registrar métrica de desempenho:', error);
    }
  }

  /**
   * Registra um log de atividade
   */
  static async trackActivity(data: ActivityLogData) {
    try {
      const client = createClient();
      const { error } = await client
        .from('activity_logs')
        .insert(data);

      if (error) {
        console.error('Erro ao registrar log de atividade:', error);
      }
    } catch (error) {
      console.error('Exceção ao registrar log de atividade:', error);
    }
  }

  /**
   * Versão do lado do servidor para registrar uso de agente
   */
  static async serverTrackAgentUsage(data: AgentUsageData) {
    try {
      // Calcular o total_tokens se não fornecido
      const total_tokens = data.total_tokens || 
        (data.input_tokens + data.output_tokens + data.prompt_tokens);
      
      const client = createServerClient();
      const { error } = await client
        .from('agent_usage')
        .insert({
          ...data,
          total_tokens,
        });

      if (error) {
        console.error('Erro ao registrar uso do agente (servidor):', error);
      }
    } catch (error) {
      console.error('Exceção ao registrar uso do agente (servidor):', error);
    }
  }

  /**
   * Registra uma métrica de início e fim de operação
   */
  static async measureOperation(
    userId: string,
    resourceType: 'agent' | 'document' | 'chat' | 'workflow' | 'prompt',
    resourceId: string,
    operation: string,
    action: (setEndTime: () => void) => Promise<void>,
    metadata?: Record<string, any>
  ) {
    const startTime = new Date();
    let success = true;
    let errorMessage = '';
    let endTime = new Date();

    const setEndTime = () => {
      endTime = new Date();
    };

    try {
      // Executar a ação medida
      await action(setEndTime);
    } catch (error: any) {
      success = false;
      errorMessage = error?.message || 'Erro desconhecido';
      // Definir o tempo de término em caso de erro
      endTime = new Date();
    } finally {
      // Registrar a métrica de desempenho
      await this.trackPerformanceMetric({
        user_id: userId,
        resource_type: resourceType,
        resource_id: resourceId,
        operation,
        start_time: startTime,
        end_time: endTime,
        duration_ms: endTime.getTime() - startTime.getTime(),
        success,
        error: errorMessage || undefined,
        metadata
      });
    }
  }

  /**
   * Recupera estatísticas de uso de agentes para um usuário
   */
  static async getAgentUsageStats(userId: string, daysBack = 30) {
    const client = createClient();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    
    const { data, error } = await client
      .from('agent_usage')
      .select('*, agents(name)')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao recuperar estatísticas de uso do agente:', error);
      return [];
    }

    return data;
  }

  /**
   * Recupera estatísticas de uso de documentos para um usuário
   */
  static async getDocumentUsageStats(userId: string, daysBack = 30) {
    const client = createClient();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    
    const { data, error } = await client
      .from('document_usage')
      .select('*, documents(name)')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao recuperar estatísticas de uso do documento:', error);
      return [];
    }

    return data;
  }

  /**
   * Recupera logs de atividade para um usuário
   */
  static async getActivityLogs(userId: string, daysBack = 7, limit = 100) {
    const client = createClient();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    
    const { data, error } = await client
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao recuperar logs de atividade:', error);
      return [];
    }

    return data;
  }
} 