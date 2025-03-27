"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

interface ApiLimitsProps {
  userId: string;
}

export function ApiLimits({ userId }: ApiLimitsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [usageStats, setUsageStats] = useState({
    daily: [] as any[],
    monthly: [] as any[],
    currentPlan: {
      name: "Básico",
      limits: {
        requestsPerHour: 1000,
        requestsPerDay: 10000,
        requestsPerMonth: 100000,
      },
      usage: {
        requestsToday: 0,
        requestsThisMonth: 0,
        percentUsedToday: 0,
        percentUsedThisMonth: 0,
      },
    },
  });

  useEffect(() => {
    async function fetchApiUsage() {
      setIsLoading(true);
      try {
        // Em um ambiente real, buscaríamos esses dados do banco de dados
        // Aqui estamos simulando dados de uso para demonstração
        
        // Simular dados de uso diário
        const today = new Date();
        const dailyData = [];
        for (let i = 0; i < 24; i++) {
          let hour = i < 10 ? `0${i}` : `${i}`;
          dailyData.push({
            hour: `${hour}:00`,
            requests: Math.floor(Math.random() * 200),
          });
        }
        
        // Simular dados de uso mensal
        const monthlyData = [];
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
          monthlyData.push({
            day: `${i}`,
            requests: i <= today.getDate() ? Math.floor(Math.random() * 2000) : 0,
          });
        }
        
        // Calcular totais
        const totalToday = dailyData.reduce((acc, curr) => acc + curr.requests, 0);
        const totalMonth = monthlyData.reduce((acc, curr) => acc + curr.requests, 0);
        
        setUsageStats({
          daily: dailyData,
          monthly: monthlyData,
          currentPlan: {
            name: "Básico",
            limits: {
              requestsPerHour: 1000,
              requestsPerDay: 10000,
              requestsPerMonth: 100000,
            },
            usage: {
              requestsToday: totalToday,
              requestsThisMonth: totalMonth,
              percentUsedToday: Math.round((totalToday / 10000) * 100),
              percentUsedThisMonth: Math.round((totalMonth / 100000) * 100),
            },
          },
        });
      } catch (error) {
        console.error("Erro ao buscar dados de uso da API:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchApiUsage();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getLimitStatusColor = (percentUsed: number) => {
    if (percentUsed < 50) return "bg-green-100 text-green-800";
    if (percentUsed < 80) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Limites do Plano</CardTitle>
              <CardDescription>Seu plano atual e utilização de recursos</CardDescription>
            </div>
            <Badge className="text-sm">{usageStats.currentPlan.name}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Requisições por Hora</p>
              <p className="text-2xl font-bold">
                {usageStats.currentPlan.limits.requestsPerHour.toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Requisições por Dia</p>
              <p className="text-2xl font-bold">
                {usageStats.currentPlan.limits.requestsPerDay.toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Requisições por Mês</p>
              <p className="text-2xl font-bold">
                {usageStats.currentPlan.limits.requestsPerMonth.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <p className="text-sm font-medium">Uso Diário</p>
                <p className="text-sm text-muted-foreground">
                  {usageStats.currentPlan.usage.requestsToday.toLocaleString()} / {usageStats.currentPlan.limits.requestsPerDay.toLocaleString()}
                </p>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getLimitStatusColor(usageStats.currentPlan.usage.percentUsedToday)}`} 
                  style={{ width: `${Math.min(usageStats.currentPlan.usage.percentUsedToday, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <p className="text-sm font-medium">Uso Mensal</p>
                <p className="text-sm text-muted-foreground">
                  {usageStats.currentPlan.usage.requestsThisMonth.toLocaleString()} / {usageStats.currentPlan.limits.requestsPerMonth.toLocaleString()}
                </p>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getLimitStatusColor(usageStats.currentPlan.usage.percentUsedThisMonth)}`} 
                  style={{ width: `${Math.min(usageStats.currentPlan.usage.percentUsedThisMonth, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {usageStats.currentPlan.usage.percentUsedToday > 80 && (
            <Alert className="mt-6 bg-yellow-50 border-yellow-200">
              <AlertTitle>Atenção ao limite diário</AlertTitle>
              <AlertDescription>
                Você já utilizou {usageStats.currentPlan.usage.percentUsedToday}% do seu limite diário de requisições.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estatísticas de Uso</CardTitle>
          <CardDescription>
            Visualização do consumo de API ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="daily" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="daily">Uso Diário</TabsTrigger>
              <TabsTrigger value="monthly">Uso Mensal</TabsTrigger>
            </TabsList>
            
            <TabsContent value="daily" className="mt-0">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usageStats.daily} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [value.toLocaleString(), "Requisições"]}
                      labelFormatter={(label) => `Hora: ${label}`}
                    />
                    <Bar dataKey="requests" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="monthly" className="mt-0">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usageStats.monthly} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [value.toLocaleString(), "Requisições"]}
                      labelFormatter={(label) => `Dia: ${label}`}
                    />
                    <Bar dataKey="requests" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 