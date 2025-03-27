"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, RefreshCw, Copy, Check, ExternalLink } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

interface ApiOverviewProps {
  userId: string;
}

export function ApiOverview({ userId }: ApiOverviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [apiUsageData, setApiUsageData] = useState({
    totalRequests: 0,
    successRate: 0,
    avgResponseTime: 0,
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchApiData() {
      setIsLoading(true);
      try {
        const supabase = createClient();
        
        // Buscar chaves API ativas
        const { data: keysData, error: keysError } = await supabase
          .from("api_keys")
          .select("*")
          .eq("user_id", userId)
          .eq("enabled", true)
          .order("created_at", { ascending: false })
          .limit(1);

        if (keysError) throw keysError;
        
        setApiKeys(keysData || []);

        // Simulando dados de uso da API - em produção, buscar de uma tabela de estatísticas
        // Esta parte seria substituída por dados reais em uma implementação completa
        setApiUsageData({
          totalRequests: Math.floor(Math.random() * 1000),
          successRate: 95 + Math.floor(Math.random() * 5),
          avgResponseTime: 120 + Math.floor(Math.random() * 100),
        });
      } catch (error) {
        console.error("Erro ao buscar dados da API:", error);
        toast.error("Não foi possível carregar os dados da API");
      } finally {
        setIsLoading(false);
      }
    }

    fetchApiData();
  }, [userId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Status da API</CardTitle>
          <CardDescription>Visão geral do uso e saúde da sua integração API</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="flex items-center mt-1">
                  <Badge className="bg-green-500">Operacional</Badge>
                </div>
              </div>
              <div>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm font-medium text-muted-foreground">Requisições</p>
                <p className="text-2xl font-bold mt-1">{apiUsageData.totalRequests}</p>
                <p className="text-xs text-muted-foreground mt-1">Últimos 30 dias</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm font-medium text-muted-foreground">Taxa de Sucesso</p>
                <p className="text-2xl font-bold mt-1">{apiUsageData.successRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">Requisições bem-sucedidas</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm font-medium text-muted-foreground">Tempo de Resposta</p>
                <p className="text-2xl font-bold mt-1">{apiUsageData.avgResponseTime}ms</p>
                <p className="text-xs text-muted-foreground mt-1">Média</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <Button variant="outline" asChild className="w-full">
            <Link href="/api?tab=limits">
              Ver estatísticas detalhadas
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chave de API</CardTitle>
          <CardDescription>Acesso à API para integrações de terceiros</CardDescription>
        </CardHeader>
        <CardContent>
          {apiKeys.length > 0 ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Chave Ativa</p>
                <div className="relative">
                  <div className="font-mono text-xs p-2 bg-muted rounded border flex items-center">
                    <span className="truncate flex-1">{apiKeys[0].key}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 absolute right-2"
                      onClick={() => copyToClipboard(apiKeys[0].key)}
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Criada em {new Date(apiKeys[0].created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">URL Base da API</p>
                <div className="relative">
                  <div className="font-mono text-xs p-2 bg-muted rounded border flex items-center">
                    <span className="truncate flex-1">https://api.example.com/v1</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 absolute right-2"
                      onClick={() => copyToClipboard("https://api.example.com/v1")}
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                Você ainda não tem nenhuma chave de API ativa
              </p>
              <Button asChild>
                <Link href="/settings">
                  Criar chave de API
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-4">
          <Button variant="outline" asChild className="w-full">
            <Link href="/settings">
              Gerenciar chaves de API
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 