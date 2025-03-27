import { useEffect, useState } from 'react';
import { AnalyticsService } from './analytics-service';
import { useUser } from '@/hooks/use-user';

/**
 * Hook para facilitar o uso do serviço de Analytics em componentes React
 */
export function useAnalytics() {
  const { user } = useUser();
  const [analyticsService, setAnalyticsService] = useState<AnalyticsService | null>(null);

  useEffect(() => {
    if (user?.id) {
      setAnalyticsService(new AnalyticsService(user.id));
    }
  }, [user?.id]);

  return {
    /**
     * Rastreia o uso de um agente - deve ser chamado quando um usuário faz uma pergunta
     */
    trackAgentQuery: (agentId: string, query: string, tokensUsed: number, responseTime: number, success: boolean = true) => {
      if (analyticsService) {
        return analyticsService.trackAgentQuery(agentId, query, tokensUsed, responseTime, success);
      }
      return Promise.resolve();
    },

    /**
     * Rastreia quando um documento é utilizado - deve ser chamado quando um documento é recuperado
     */
    trackDocumentRetrieval: (documentId: string, agentId?: string, retrievalCount: number = 1) => {
      if (analyticsService) {
        return analyticsService.trackDocumentRetrieval(documentId, agentId, retrievalCount);
      }
      return Promise.resolve();
    },

    /**
     * Rastreia uma métrica de desempenho
     */
    trackPerformanceMetric: (metricType: string, metricValue: number, agentId?: string) => {
      if (analyticsService) {
        return analyticsService.trackPerformanceMetric(metricType, metricValue, agentId);
      }
      return Promise.resolve();
    },

    /**
     * Rastreia uma atividade do usuário - útil para login, criação de recursos, etc.
     */
    trackActivity: (activityType: string, details: any = {}, ipAddress?: string) => {
      if (analyticsService) {
        return analyticsService.trackActivity(activityType, details, ipAddress);
      }
      return Promise.resolve();
    },

    /**
     * Obtém estatísticas de uso de agentes
     */
    getAgentUsageStats: (startDate?: Date, endDate?: Date) => {
      if (analyticsService) {
        return analyticsService.getAgentUsageStats(startDate, endDate);
      }
      return Promise.resolve([]);
    },

    /**
     * Obtém estatísticas de uso de documentos
     */
    getDocumentUsageStats: (startDate?: Date, endDate?: Date) => {
      if (analyticsService) {
        return analyticsService.getDocumentUsageStats(startDate, endDate);
      }
      return Promise.resolve([]);
    },

    /**
     * Obtém logs de atividades
     */
    getActivityLogs: (startDate?: Date, endDate?: Date, limit: number = 50) => {
      if (analyticsService) {
        return analyticsService.getActivityLogs(startDate, endDate, limit);
      }
      return Promise.resolve([]);
    }
  };
} 