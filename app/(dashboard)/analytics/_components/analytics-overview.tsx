"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Loader2, Bot, MessageSquare, Database, Clock, Users } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";

interface AnalyticsOverviewProps {
  userId: string;
}

export function AnalyticsOverview({ userId }: AnalyticsOverviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] = useState({
    totalAgents: 0,
    totalChats: 0,
    totalMessages: 0,
    totalKnowledgeBases: 0,
    activeAgents: 0,
    averageResponseTime: 0,
    agentUsage: [] as {name: string; value: number}[],
    messagesByDay: [] as {day: string; count: number}[],
    knowledgeBaseUsage: [] as {name: string; value: number}[]
  });

  useEffect(() => {
    async function fetchAnalyticsData() {
      setIsLoading(true);
      try {
        const supabase = createClient();
        
        // Buscar contagem de agentes
        const { count: agentsCount, error: agentsError } = await supabase
          .from("agents")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId);
        
        // Buscar contagem de chats
        const { count: chatsCount, error: chatsError } = await supabase
          .from("chats")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId);
          
        // Buscar contagem de bases de conhecimento
        const { count: kbCount, error: kbError } = await supabase
          .from("knowledge_base")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId);

        // Simulando dados de mensagens
        const messagesCount = 0; // Definimos um valor padrão enquanto ajustamos a consulta SQL
        
        // Simular dados para o gráfico de mensagens por dia
        const today = new Date();
        const messagesByDay = Array.from({ length: 14 }).map((_, i) => {
          const date = new Date(today);
          date.setDate(date.getDate() - 13 + i);
          const day = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
          return {
            day,
            count: Math.floor(Math.random() * 50) + 10
          };
        });
        
        // Simular dados para uso de bases de conhecimento
        const knowledgeBaseUsage = [
          { name: "Produtos", value: 42 },
          { name: "Suporte", value: 28 },
          { name: "Vendas", value: 15 },
          { name: "Marketing", value: 10 },
          { name: "Outros", value: 5 }
        ];
        
        // Simular dados de uso de agentes para o gráfico de pizza
        const agentUsage = [
          { name: "Assistente de Vendas", value: 35 },
          { name: "Suporte Técnico", value: 30 },
          { name: "Atendimento", value: 20 },
          { name: "Especialista em Produtos", value: 15 }
        ];
        
        setOverview({
          totalAgents: agentsCount || 0,
          totalChats: chatsCount || 0,
          totalMessages: messagesCount || 0,
          totalKnowledgeBases: kbCount || 0,
          activeAgents: Math.floor((agentsCount || 0) * 0.7),
          averageResponseTime: Math.floor(Math.random() * 800) + 200, // Simulando tempo médio de resposta
          agentUsage,
          messagesByDay,
          knowledgeBaseUsage
        });
      } catch (error) {
        console.error("Erro ao buscar dados de análise:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalyticsData();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Cores para os gráficos de pizza
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  return (
    <div className="space-y-6">
      {/* Cards com métricas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Agentes Totais</div>
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold">{overview.totalAgents}</div>
              <div className="text-xs text-muted-foreground">
                {overview.activeAgents} ativos
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Conversas</div>
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold">{overview.totalChats}</div>
              <div className="text-xs text-muted-foreground">
                {overview.totalMessages} mensagens
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Bases de Conhecimento</div>
              <Database className="h-5 w-5 text-primary" />
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold">{overview.totalKnowledgeBases}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Tempo de Resposta</div>
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold">{overview.averageResponseTime}ms</div>
              <div className="text-xs text-muted-foreground">
                média
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mensagens por Dia</CardTitle>
            <CardDescription>
              Volume de mensagens trocadas nos últimos 14 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overview.messagesByDay}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} mensagens`, 'Quantidade']} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uso de Agentes</CardTitle>
            <CardDescription>
              Distribuição de uso entre os diferentes agentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={overview.agentUsage}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {overview.agentUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} conversas`, 'Quantidade']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="outline" asChild className="w-full">
              <Link href="/analytics?tab=agents">
                Ver análise detalhada de agentes
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Uso de Bases de Conhecimento</CardTitle>
            <CardDescription>
              Distribuição de uso entre as diferentes bases de conhecimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={overview.knowledgeBaseUsage}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {overview.knowledgeBaseUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} consultas`, 'Quantidade']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="outline" asChild className="w-full">
              <Link href="/analytics?tab=knowledge">
                Ver análise detalhada de bases de conhecimento
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo de Atividades</CardTitle>
            <CardDescription>
              Visão geral das atividades recentes na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="daily">
              <TabsList className="mb-4">
                <TabsTrigger value="daily">Diário</TabsTrigger>
                <TabsTrigger value="weekly">Semanal</TabsTrigger>
                <TabsTrigger value="monthly">Mensal</TabsTrigger>
              </TabsList>
              
              <TabsContent value="daily" className="mt-0 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Mensagens Hoje</span>
                    </div>
                    <span className="font-bold">{overview.messagesByDay[overview.messagesByDay.length - 1]?.count || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Agentes Utilizados</span>
                    </div>
                    <span className="font-bold">{Math.floor(Math.random() * 5) + 1}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Consultas a Bases</span>
                    </div>
                    <span className="font-bold">{Math.floor(Math.random() * 15) + 5}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Usuários Ativos</span>
                    </div>
                    <span className="font-bold">1</span>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="weekly" className="mt-0 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Mensagens na Semana</span>
                    </div>
                    <span className="font-bold">{overview.messagesByDay.slice(-7).reduce((acc, day) => acc + day.count, 0)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Agentes Utilizados</span>
                    </div>
                    <span className="font-bold">{Math.min(overview.agentUsage.length, Math.floor(Math.random() * 3) + 3)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Consultas a Bases</span>
                    </div>
                    <span className="font-bold">{Math.floor(Math.random() * 50) + 20}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Usuários Ativos</span>
                    </div>
                    <span className="font-bold">1</span>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="monthly" className="mt-0 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Mensagens no Mês</span>
                    </div>
                    <span className="font-bold">{overview.messagesByDay.reduce((acc, day) => acc + day.count, 0)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Agentes Utilizados</span>
                    </div>
                    <span className="font-bold">{overview.totalAgents}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Consultas a Bases</span>
                    </div>
                    <span className="font-bold">{Math.floor(Math.random() * 200) + 50}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Usuários Ativos</span>
                    </div>
                    <span className="font-bold">1</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="outline" asChild className="w-full">
              <Link href="/analytics?tab=chats">
                Ver análise detalhada de conversas
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 