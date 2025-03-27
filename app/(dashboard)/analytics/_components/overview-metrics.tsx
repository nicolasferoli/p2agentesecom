'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Bot, FileText, MessageSquare, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAnalytics } from '@/lib/analytics/use-analytics';

interface OverviewMetricsProps {
  userId: string;
}

export function OverviewMetrics({ userId }: OverviewMetricsProps) {
  const { getAgentUsageStats, getDocumentUsageStats, getActivityLogs } = useAnalytics();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({
    totalQueries: 0,
    totalDocumentsUsed: 0,
    totalAgents: 0,
    successRate: 0,
    activityByDay: [] as { date: string, count: number }[],
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      
      try {
        // Obter estatísticas de uso de agentes
        const agentUsage = await getAgentUsageStats();
        const documentUsage = await getDocumentUsageStats();
        const activityLogs = await getActivityLogs();
        
        // Processar dados
        const totalQueries = agentUsage.length;
        const totalDocumentsUsed = documentUsage.length;
        
        // Calcular taxa de sucesso
        const successfulQueries = agentUsage.filter(usage => 
          usage.status === 'completed'
        ).length;
        const successRate = totalQueries > 0 
          ? (successfulQueries / totalQueries) * 100 
          : 0;
        
        // Obter IDs únicos de agentes
        const uniqueAgents = new Set(agentUsage.map(usage => usage.agent_id));
        const totalAgents = uniqueAgents.size;
        
        // Agrupar atividades por dia
        const activityByDay = processActivityByDay(activityLogs);
        
        setMetrics({
          totalQueries,
          totalDocumentsUsed,
          totalAgents,
          successRate,
          activityByDay,
        });
      } catch (err) {
        console.error("Erro ao recuperar dados para overview:", err);
        setError("Erro ao carregar métricas. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [userId, getAgentUsageStats, getDocumentUsageStats, getActivityLogs]);

  // Processa logs de atividade para gerar dados de gráfico por dia
  function processActivityByDay(logs: any[]) {
    if (!logs || logs.length === 0) {
      // Dados de demonstração se não houver logs
      return Array.from({ length: 7 }).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 10) + 1
        };
      });
    }

    // Agrupar por data
    const dateGroups: Record<string, number> = {};
    logs.forEach(log => {
      const date = new Date(log.created_at).toISOString().split('T')[0];
      dateGroups[date] = (dateGroups[date] || 0) + 1;
    });
    
    // Converter para array e ordenar
    return Object.keys(dateGroups).map(date => ({
      date,
      count: dateGroups[date]
    })).sort((a, b) => a.date.localeCompare(b.date));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Carregando métricas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-40 text-destructive">
        <Activity className="h-8 w-8 mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Consultas Totais</CardTitle>
            <CardDescription>Total de consultas processadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 text-primary mr-2" />
              <div className="text-3xl font-bold">{metrics.totalQueries.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Taxa de Sucesso</CardTitle>
            <CardDescription>Porcentagem de consultas bem-sucedidas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Activity className="h-5 w-5 text-primary mr-2" />
              <div className="text-3xl font-bold">{metrics.successRate.toFixed(1)}%</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Documentos Utilizados</CardTitle>
            <CardDescription>Total de documentos recuperados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-primary mr-2" />
              <div className="text-3xl font-bold">{metrics.totalDocumentsUsed.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Agentes Ativos</CardTitle>
            <CardDescription>Número de agentes em uso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Bot className="h-5 w-5 text-primary mr-2" />
              <div className="text-3xl font-bold">{metrics.totalAgents.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Atividade por Dia</CardTitle>
          <CardDescription>Volume de atividades nos últimos dias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.activityByDay}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" name="Atividades" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 