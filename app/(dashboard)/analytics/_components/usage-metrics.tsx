"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Bot, Database, FileText, BarChart3, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnalyticsService } from "@/lib/services/analytics-service";
import { AgentUsage, DocumentUsage, PerformanceMetric, ActivityLog } from "@/shared/types/supabase";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

interface UsageMetricsProps {
  userId: string;
}

// Interfaces estendidas para incluir relações (não presentes no tipo base)
interface AgentUsageWithRelations extends AgentUsage {
  agents?: { name: string };
}

interface DocumentUsageWithRelations extends DocumentUsage {
  documents?: { name: string };
}

export function UsageMetrics({ userId }: UsageMetricsProps) {
  const [activeTab, setActiveTab] = useState("agent-usage");
  const [agentUsage, setAgentUsage] = useState<AgentUsageWithRelations[]>([]);
  const [documentUsage, setDocumentUsage] = useState<DocumentUsageWithRelations[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(30); // Dias

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Carregar dados de uso de agentes
      const agentData = await AnalyticsService.getAgentUsageStats(userId, timeRange);
      setAgentUsage(agentData as AgentUsageWithRelations[]);
      
      // Carregar dados de uso de documentos
      const documentData = await AnalyticsService.getDocumentUsageStats(userId, timeRange);
      setDocumentUsage(documentData as DocumentUsageWithRelations[]);
      
      // Carregar logs de atividade
      const logData = await AnalyticsService.getActivityLogs(userId, timeRange);
      setActivityLogs(logData);
    } catch (err) {
      console.error("Erro ao carregar dados de uso:", err);
      setError("Não foi possível carregar dados de uso. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };
  
  // Carregar dados iniciais
  useEffect(() => {
    fetchData();
  }, [userId, timeRange]);

  // Funções utilitárias para análise de dados
  const calculateTotalTokens = () => {
    return agentUsage.reduce((total, record) => total + record.total_tokens, 0);
  };
  
  const calculateTotalProcessedTokens = () => {
    return documentUsage.reduce((total, record) => total + record.tokens_processed, 0);
  };
  
  const getAverageResponseTime = () => {
    if (agentUsage.length === 0) return 0;
    const total = agentUsage.reduce((sum, record) => sum + record.duration_ms, 0);
    return Math.round(total / agentUsage.length);
  };
  
  const getSuccessRate = () => {
    if (agentUsage.length === 0) return 100;
    const successCount = agentUsage.filter(record => record.status === "completed").length;
    return Math.round((successCount / agentUsage.length) * 100);
  };

  const getModelUsage = () => {
    const models: Record<string, number> = {};
    
    agentUsage.forEach(record => {
      if (!models[record.model]) {
        models[record.model] = 0;
      }
      models[record.model] += record.total_tokens;
    });
    
    return Object.entries(models)
      .map(([model, tokens]) => ({ model, tokens }))
      .sort((a, b) => b.tokens - a.tokens);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-destructive" />
            <div className="text-lg font-medium">{error}</div>
            <Button onClick={fetchData}>Tentar novamente</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  };
  
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-semibold">Métricas de Uso Detalhadas</h3>
        <div className="space-x-2">
          <Button 
            variant={timeRange === 7 ? "default" : "outline"} 
            size="sm" 
            onClick={() => setTimeRange(7)}
          >
            7 dias
          </Button>
          <Button 
            variant={timeRange === 30 ? "default" : "outline"} 
            size="sm" 
            onClick={() => setTimeRange(30)}
          >
            30 dias
          </Button>
          <Button 
            variant={timeRange === 90 ? "default" : "outline"} 
            size="sm" 
            onClick={() => setTimeRange(90)}
          >
            90 dias
          </Button>
        </div>
      </div>

      {/* Resumo de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="mr-4 bg-primary/10 p-2 rounded-full">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Tokens</p>
              <h3 className="text-2xl font-bold">{formatNumber(calculateTotalTokens())}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="mr-4 bg-primary/10 p-2 rounded-full">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tempo Médio de Resposta</p>
              <h3 className="text-2xl font-bold">{formatNumber(getAverageResponseTime())} ms</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="mr-4 bg-primary/10 p-2 rounded-full">
              <Database className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tokens Processados (Docs)</p>
              <h3 className="text-2xl font-bold">{formatNumber(calculateTotalProcessedTokens())}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="mr-4 bg-primary/10 p-2 rounded-full">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Taxa de Sucesso</p>
              <h3 className="text-2xl font-bold">{getSuccessRate()}%</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dados detalhados */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="agent-usage">Uso de Agentes</TabsTrigger>
          <TabsTrigger value="document-usage">Uso de Documentos</TabsTrigger>
          <TabsTrigger value="activity-logs">Logs de Atividade</TabsTrigger>
          <TabsTrigger value="model-usage">Uso por Modelo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="agent-usage" className="space-y-4">
          <Table>
            <TableCaption>Registros de uso de agentes nos últimos {timeRange} dias</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Agente</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Total Tokens</TableHead>
                <TableHead>Duração (ms)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agentUsage.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Nenhum registro de uso de agentes encontrado
                  </TableCell>
                </TableRow>
              ) : (
                agentUsage.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{formatDate(record.created_at)}</TableCell>
                    <TableCell>{record.agents?.name || record.agent_id.substring(0, 8)}</TableCell>
                    <TableCell>{record.model}</TableCell>
                    <TableCell>{formatNumber(record.total_tokens)}</TableCell>
                    <TableCell>{formatNumber(record.duration_ms)}</TableCell>
                    <TableCell>
                      <Badge variant={record.status === "completed" ? "default" : "destructive"}>
                        {record.status === "completed" ? "Sucesso" : "Erro"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>
        
        <TabsContent value="document-usage" className="space-y-4">
          <Table>
            <TableCaption>Registros de uso de documentos nos últimos {timeRange} dias</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Operação</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Tokens Processados</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentUsage.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Nenhum registro de uso de documentos encontrado
                  </TableCell>
                </TableRow>
              ) : (
                documentUsage.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{formatDate(record.created_at)}</TableCell>
                    <TableCell>{record.documents?.name || record.document_id.substring(0, 8)}</TableCell>
                    <TableCell>{record.operation_type}</TableCell>
                    <TableCell>{record.document_type}</TableCell>
                    <TableCell>{formatNumber(record.tokens_processed)}</TableCell>
                    <TableCell>
                      <Badge variant={record.status === "completed" ? "default" : "destructive"}>
                        {record.status === "completed" ? "Sucesso" : "Erro"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>
        
        <TabsContent value="activity-logs" className="space-y-4">
          <Table>
            <TableCaption>Logs de atividade nos últimos {timeRange} dias</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Tipo de Entidade</TableHead>
                <TableHead>ID da Entidade</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activityLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Nenhum log de atividade encontrado
                  </TableCell>
                </TableRow>
              ) : (
                activityLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{formatDate(log.created_at)}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.entity_type || "N/A"}</TableCell>
                    <TableCell>{log.entity_id ? log.entity_id.substring(0, 8) : "N/A"}</TableCell>
                    <TableCell>{log.ip_address || "N/A"}</TableCell>
                    <TableCell>
                      {log.details ? 
                        <Button variant="ghost" size="sm">Detalhes</Button> : 
                        "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>
        
        <TabsContent value="model-usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Uso por Modelo</CardTitle>
              <CardDescription>
                Tokens consumidos por modelo nos últimos {timeRange} dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getModelUsage().map(({ model, tokens }, index) => (
                  <div key={model}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{model}</span>
                      <span className="text-sm text-muted-foreground">{formatNumber(tokens)} tokens</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden bg-secondary">
                      <div 
                        className="h-full bg-primary" 
                        style={{ 
                          width: `${(tokens / calculateTotalTokens()) * 100}%` 
                        }} 
                      />
                    </div>
                    {index < getModelUsage().length - 1 && <Separator className="my-3" />}
                  </div>
                ))}

                {getModelUsage().length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    Nenhum dado de uso de modelos disponível
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 