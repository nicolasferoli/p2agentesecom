'use client';

import { useState } from 'react';
import { seedAnalyticsData } from '@/lib/analytics/seed-analytics-data';
import { toast } from 'sonner';

export function useAgentAnalytics() {
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * Função para gerar dados de analytics para testes
   * @param userId ID do usuário para o qual serão gerados os dados
   * @param agentIds Array de IDs dos agentes que serão usados
   * @param documentIds Array de IDs dos documentos que serão usados
   */
  const generateSampleData = async (
    userId: string,
    agentIds: string[],
    documentIds: string[]
  ) => {
    if (!userId || agentIds.length === 0 || documentIds.length === 0) {
      toast.error("É necessário fornecer userId, agentIds e documentIds válidos.");
      return;
    }

    setIsGenerating(true);

    try {
      const result = await seedAnalyticsData(userId, agentIds, documentIds);
      
      if (result.success) {
        toast.success(`Dados de exemplo gerados com sucesso: ${result.counts?.agent_usage || 0} registros de uso de agentes, ${result.counts?.document_usage || 0} registros de uso de documentos, ${result.counts?.performance_metrics || 0} métricas de desempenho e ${result.counts?.activity_logs || 0} logs de atividade.`);
        return result;
      } else {
        toast.error(result.message || "Falha ao gerar dados de exemplo.");
        return null;
      }
    } catch (error) {
      console.error("Erro ao gerar dados de exemplo:", error);
      toast.error("Ocorreu um erro ao gerar dados de exemplo. Verifique o console para mais detalhes.");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generateSampleData
  };
} 