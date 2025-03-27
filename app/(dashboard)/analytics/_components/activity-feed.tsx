'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Bot, FileText, Activity, Database, Calendar, Info } from 'lucide-react';
import { useAnalytics } from '@/lib/analytics/use-analytics';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ActivityFeedProps {
  userId: string;
}

export function ActivityFeed({ userId }: ActivityFeedProps) {
  const { getActivityLogs } = useAnalytics();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      
      try {
        // Obter logs de atividade
        const activityLogs = await getActivityLogs(undefined, undefined, 50);
        
        if (activityLogs.length === 0) {
          setActivities(generateDemoActivities());
        } else {
          setActivities(activityLogs);
        }
      } catch (err) {
        console.error("Erro ao recuperar logs de atividade:", err);
        setError("Erro ao carregar atividades. Tente novamente mais tarde.");
        setActivities(generateDemoActivities());
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [userId, getActivityLogs]);

  // Gera atividades de demonstração para testar o componente
  function generateDemoActivities() {
    const actionTypes = [
      'login', 
      'create_agent', 
      'edit_agent', 
      'upload_document', 
      'create_knowledge_base',
      'start_chat_session',
      'delete_document',
      'settings_update'
    ];
    
    return Array.from({ length: 20 }).map((_, i) => {
      const date = new Date();
      date.setHours(date.getHours() - i);
      
      const actionType = actionTypes[Math.floor(Math.random() * actionTypes.length)];
      
      const details = {
        browser: ['Chrome', 'Firefox', 'Safari'][Math.floor(Math.random() * 3)],
        device: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)],
        agent_name: `Agente ${Math.floor(Math.random() * 10) + 1}`,
        document_name: `Documento ${Math.floor(Math.random() * 20) + 1}.pdf`,
        knowledge_base_name: `Base de Conhecimento ${Math.floor(Math.random() * 5) + 1}`
      };
      
      return {
        id: `demo-${i}`,
        action: actionType,
        created_at: date.toISOString(),
        details
      };
    });
  }

  function getActivityIcon(action: string) {
    switch (action) {
      case 'login':
        return <User className="h-4 w-4" />;
      case 'create_agent':
      case 'edit_agent':
        return <Bot className="h-4 w-4" />;
      case 'upload_document':
      case 'delete_document':
        return <FileText className="h-4 w-4" />;
      case 'create_knowledge_base':
        return <Database className="h-4 w-4" />;
      case 'start_chat_session':
        return <Activity className="h-4 w-4" />;
      case 'settings_update':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  }

  function getActivityDescription(activity: any) {
    const details = activity.details || {};
    
    switch (activity.action) {
      case 'login':
        return `Login realizado via ${details.browser || 'navegador'} em um dispositivo ${details.device || 'desconhecido'}`;
      case 'create_agent':
        return `Novo agente "${details.agent_name || 'Sem nome'}" criado`;
      case 'edit_agent':
        return `Agente "${details.agent_name || 'Sem nome'}" atualizado`;
      case 'upload_document':
        return `Documento "${details.document_name || 'Sem nome'}" carregado`;
      case 'delete_document':
        return `Documento "${details.document_name || 'Sem nome'}" excluído`;
      case 'create_knowledge_base':
        return `Base de conhecimento "${details.knowledge_base_name || 'Sem nome'}" criada`;
      case 'start_chat_session':
        return `Conversa iniciada com "${details.agent_name || 'agente'}"`;
      case 'settings_update':
        return `Configurações do sistema atualizadas`;
      default:
        return `${activity.action.replace(/_/g, ' ')}`;
    }
  }

  function formatDate(dateString: string) {
    try {
      const date = new Date(dateString);
      return format(date, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  }
  
  function getActivityBadge(action: string) {
    switch (action) {
      case 'login':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Login</Badge>;
      case 'create_agent':
      case 'edit_agent':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Agente</Badge>;
      case 'upload_document':
      case 'delete_document':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800">Documento</Badge>;
      case 'create_knowledge_base':
        return <Badge variant="outline" className="bg-indigo-100 text-indigo-800">Conhecimento</Badge>;
      case 'start_chat_session':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Chat</Badge>;
      case 'settings_update':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Configuração</Badge>;
      default:
        return <Badge variant="outline">{action.replace(/_/g, ' ')}</Badge>;
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Carregando atividades...</span>
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
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Atividades</CardTitle>
        <CardDescription>
          Registro de atividades recentes na plataforma
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <div key={activity.id || index} className="flex">
                <div className="mr-4 flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    {getActivityIcon(activity.action)}
                  </div>
                  {index < activities.length - 1 && (
                    <div className="w-px grow bg-muted" />
                  )}
                </div>
                <div className="flex flex-col gap-2 pb-8">
                  <div className="flex items-center gap-2">
                    {getActivityBadge(activity.action)}
                    <span className="text-xs text-muted-foreground">
                      {formatDate(activity.created_at)}
                    </span>
                  </div>
                  <p className="text-sm">{getActivityDescription(activity)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma atividade registrada
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 