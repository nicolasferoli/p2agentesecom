import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUserFromServerComponent } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Bot, Database, FileText, MessageSquare, GitBranch } from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUserFromServerComponent();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bem-vindo, {user?.name || 'usuário'}!</h1>
        <p className="mt-1 text-muted-foreground">
          Sua plataforma completa para gerenciamento de agentes de IA
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard 
          title="Agentes" 
          description="Agentes ativos" 
          value="0"
          icon={<Bot className="h-6 w-6" />}
        />
        <DashboardCard 
          title="Bases de Conhecimento" 
          description="Bases criadas" 
          value="0"
          icon={<Database className="h-6 w-6" />}
        />
        <DashboardCard 
          title="Prompts" 
          description="Templates salvos" 
          value="0"
          icon={<FileText className="h-6 w-6" />}
        />
        <DashboardCard 
          title="Conversas" 
          description="Chats realizados" 
          value="0"
          icon={<MessageSquare className="h-6 w-6" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>Suas últimas ações na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Nenhuma atividade recente encontrada.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Início Rápido</CardTitle>
            <CardDescription>Como começar a usar a plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  1
                </div>
                <span>Crie uma base de conhecimento</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  2
                </div>
                <span>Adicione documentos e conteúdo</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  3
                </div>
                <span>Configure um agente vinculado à base</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  4
                </div>
                <span>Inicie uma conversa com seu agente</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  description: string;
  value: string;
  icon: React.ReactNode;
}

function DashboardCard({ title, description, value, icon }: DashboardCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="rounded-md bg-primary/10 p-2 text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
} 