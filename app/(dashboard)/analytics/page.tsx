import { redirect } from "next/navigation";
import { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import { AgentAnalytics } from "./_components/agent-analytics";
import { getCurrentUserFromServerComponent } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Análise",
  description: "Visualize métricas e análises sobre o uso da plataforma.",
};

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

function LoadingUI() {
  return (
    <div className="flex justify-center items-center h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

interface AnalyticsPageProps {
  searchParams: {
    tab?: string;
  };
}

export default async function AnalyticsPage({
  searchParams,
}: AnalyticsPageProps) {
  // Obter usuário atual
  const userData = await getCurrentUserFromServerComponent();
  
  if (!userData || !userData.id) {
    console.error("Erro ao obter usuário");
    redirect("/login?callbackUrl=/analytics");
  }

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Monitore o desempenho e uso dos seus agentes
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-6">
          <Suspense fallback={<LoadingUI />}>
            <AgentAnalytics userId={userData.id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
} 