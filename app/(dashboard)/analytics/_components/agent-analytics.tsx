"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Loader2, Bot, MessageSquare, Info, AlertCircle } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAnalytics } from "@/lib/analytics/use-analytics";
import { useUser } from "@/hooks/use-user";

interface AgentAnalyticsProps {
  userId: string;
}

export function AgentAnalytics({ userId }: AgentAnalyticsProps) {
  const { getAgentUsageStats, getDocumentUsageStats, getActivityLogs } = useAnalytics();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agentData, setAgentData] = useState<any>({
    agents: [],
    usageByDate: [],
    topQueriesByAgent: {},
    totalQueries: 0,
    successRate: 0
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      
      try {
        // Obter estatísticas de uso de agentes
        const agentUsage = await getAgentUsageStats();
        
        // Se não houver dados, use dados de demonstração
        if (!agentUsage || agentUsage.length === 0) {
          setAgentData(generateDemoData());
          setLoading(false);
          return;
        }
        
        // Processar dados reais
        const processedData = processRealData(agentUsage);
        setAgentData(processedData);
      } catch (err) {
        console.error("Erro ao recuperar estatísticas de uso do agente:", err);
        setError("Erro ao carregar estatísticas de agentes. Tente novamente mais tarde.");
        // Usar dados de demonstração como fallback
        setAgentData(generateDemoData());
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [userId, getAgentUsageStats]);

  // Processa dados reais do banco de dados
  function processRealData(agentUsage: any[]) {
    if (!agentUsage || agentUsage.length === 0) {
      return generateDemoData();
    }

    // Agrupar por agente
    const agentGroups: Record<string, any[]> = {};
    agentUsage.forEach(usage => {
      if (!agentGroups[usage.agent_id]) {
        agentGroups[usage.agent_id] = [];
      }
      agentGroups[usage.agent_id].push(usage);
    });

    // Processar dados por agente
    const agents = Object.keys(agentGroups).map(agentId => {
      const usages = agentGroups[agentId];
      const totalQueries = usages.length;
      const successfulQueries = usages.filter(u => u.success).length;
      const avgResponseTime = usages.reduce((sum, u) => sum + u.response_time, 0) / totalQueries;
      
      return {
        id: agentId,
        name: `Agente ${agentId.substring(0, 8)}`, // Use um nome real se tiver acesso
        queryCount: totalQueries,
        successRate: (successfulQueries / totalQueries) * 100,
        avgResponseTime: avgResponseTime,
        model: "Modelo desconhecido", // Substituir por dados reais quando disponíveis
        // Outros dados do agente...
        enabled: true,
        temperature: 0.7,
        created_at: usages[0].created_at
      };
    });

    // Agrupar consultas por data (para gráficos de linha)
    const dateGroups: Record<string, number> = {};
    agentUsage.forEach(usage => {
      const date = new Date(usage.created_at).toISOString().split('T')[0];
      dateGroups[date] = (dateGroups[date] || 0) + 1;
    });
    
    const usageByDate = Object.keys(dateGroups).map(date => ({
      date,
      queries: dateGroups[date]
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Obter as consultas mais comuns por agente
    const topQueriesByAgent: Record<string, any[]> = {};
    Object.keys(agentGroups).forEach(agentId => {
      const queries = agentGroups[agentId];
      
      // Contar ocorrências de cada consulta
      const queryCounts: Record<string, number> = {};
      queries.forEach(q => {
        queryCounts[q.query] = (queryCounts[q.query] || 0) + 1;
      });
      
      // Converter para array e ordenar
      topQueriesByAgent[agentId] = Object.keys(queryCounts)
        .map(query => ({ query, count: queryCounts[query] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 consultas
    });

    // Calcular métricas gerais
    const totalQueries = agentUsage.length;
    const successfulQueries = agentUsage.filter(u => u.success).length;
    const successRate = totalQueries > 0 ? (successfulQueries / totalQueries) * 100 : 0;

    return {
      agents,
      usageByDate,
      topQueriesByAgent,
      totalQueries,
      successRate
    };
  }

  // Gera dados de demonstração para testes
  function generateDemoData() {
    // Dados de agentes fictícios
    const agents = [
      {
        id: "1",
        name: "Assistente de Vendas",
        queryCount: 248,
        successRate: 94.3,
        avgResponseTime: 0.8,
        model: "gpt-3.5-turbo",
        enabled: true,
        temperature: 0.7,
        knowledge_base: { name: "Produtos" },
        created_at: new Date().toISOString()
      },
      {
        id: "2",
        name: "Suporte ao Cliente",
        queryCount: 187,
        successRate: 92.1,
        avgResponseTime: 1.2,
        model: "gpt-4",
        enabled: true,
        temperature: 0.5,
        knowledge_base: { name: "FAQ Suporte" },
        created_at: new Date().toISOString()
      },
      {
        id: "3",
        name: "Assistente de Marketing",
        queryCount: 132,
        successRate: 89.5,
        avgResponseTime: 0.9,
        model: "gpt-3.5-turbo",
        enabled: false,
        temperature: 0.8,
        knowledge_base: { name: "Campanhas" },
        created_at: new Date().toISOString()
      }
    ];

    // Gerar dados de uso por data (últimos 7 dias)
    const usageByDate = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        queries: Math.floor(Math.random() * 50) + 20
      };
    });

    // Top consultas por agente
    const topQueriesByAgent: Record<string, any[]> = {};
    
    // Para o agente de vendas
    topQueriesByAgent["1"] = [
      { query: "Qual o preço do produto X?", count: 43 },
      { query: "Tem desconto para compras em quantidade?", count: 37 },
      { query: "Quais são as formas de pagamento?", count: 29 },
      { query: "Quanto tempo leva para entregar?", count: 24 },
      { query: "Vocês têm o produto Y em estoque?", count: 18 }
    ];
    
    // Para o agente de suporte
    topQueriesByAgent["2"] = [
      { query: "Como faço para trocar meu produto?", count: 41 },
      { query: "Meu pedido está atrasado", count: 35 },
      { query: "Não recebi meu código de rastreamento", count: 26 },
      { query: "Como cancelo meu pedido?", count: 22 },
      { query: "O produto chegou com defeito", count: 17 }
    ];
    
    // Para o agente de marketing
    topQueriesByAgent["3"] = [
      { query: "Quais são as campanhas ativas?", count: 28 },
      { query: "Quanto estamos investindo em anúncios?", count: 25 },
      { query: "Qual foi o resultado da última campanha?", count: 21 },
      { query: "Como está o engajamento nas redes sociais?", count: 19 },
      { query: "Quais são os produtos mais vendidos?", count: 16 }
    ];

    return {
      agents,
      usageByDate,
      topQueriesByAgent,
      totalQueries: 567,
      successRate: 92.3
    };
  }

  function renderAgentStatus(status: boolean) {
    return status ? (
      <Badge variant="outline" className="bg-green-100 text-green-800">Ativo</Badge>
    ) : (
      <Badge variant="secondary">Inativo</Badge>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Carregando estatísticas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-40 text-destructive">
        <AlertCircle className="h-8 w-8 mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total de Consultas</CardTitle>
            <CardDescription>Consultas processadas por todos os agentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{agentData.totalQueries.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Taxa de Sucesso</CardTitle>
            <CardDescription>Porcentagem de consultas respondidas com sucesso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{agentData.successRate.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Agentes Ativos</CardTitle>
            <CardDescription>Número de agentes em uso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {agentData.agents.filter((a: any) => a.enabled).length}/{agentData.agents.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Consultas por Dia</CardTitle>
          <CardDescription>
            Volume de consultas nos últimos 7 dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={agentData.usageByDate}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="queries" stroke="#2563eb" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {agentData.agents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detalhes dos Agentes</CardTitle>
            <CardDescription>
              Informações detalhadas sobre cada agente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Base de Conhecimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Temperatura</TableHead>
                    <TableHead>Criado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agentData.agents.length > 0 ? (
                    agentData.agents.map((agent: any) => (
                      <TableRow key={agent.id}>
                        <TableCell className="font-medium">{agent.name}</TableCell>
                        <TableCell>{agent.model}</TableCell>
                        <TableCell>
                          {agent.knowledge_base ? agent.knowledge_base.name : (
                            <span className="text-muted-foreground">Nenhuma</span>
                          )}
                        </TableCell>
                        <TableCell>{renderAgentStatus(agent.enabled)}</TableCell>
                        <TableCell>{agent.temperature.toFixed(1)}</TableCell>
                        <TableCell>{new Date(agent.created_at).toLocaleDateString('pt-BR')}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                        Nenhum agente encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {agentData.agents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Consultas Frequentes</CardTitle>
            <CardDescription>
              As consultas mais frequentes por agente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={agentData.agents[0]?.id}>
              <TabsList className="mb-4 flex-wrap">
                {agentData.agents.map((agent: any) => (
                  <TabsTrigger key={agent.id} value={agent.id}>
                    {agent.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {agentData.agents.map((agent: any) => (
                <TabsContent key={agent.id} value={agent.id} className="mt-0">
                  <div className="space-y-4">
                    {agentData.topQueriesByAgent[agent.id]?.map((item: any, index: number) => (
                      <div key={index} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{item.query}</span>
                          </div>
                          <span className="text-sm font-medium">{item.count}</span>
                        </div>
                        <Progress value={(item.count / (agentData.topQueriesByAgent[agent.id][0]?.count || 1)) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 