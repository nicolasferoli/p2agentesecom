import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ApiOverview } from "./_components/api-overview";
import { ApiEndpoints } from "./_components/api-endpoints";
import { ApiDocs } from "./_components/api-docs";
import { ApiLimits } from "./_components/api-limits";
import { getCurrentUserFromServerComponent } from "@/lib/supabase/server";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "API",
  description: "Gerencie sua integração com a API.",
};

function LoadingUI() {
  return (
    <div className="flex justify-center items-center h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default async function ApiPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  try {
    const user = await getCurrentUserFromServerComponent();
    
    // Acessar searchParams de forma segura, convertendo para string se necessário
    const tabParam = searchParams?.tab;
    const defaultTab = typeof tabParam === 'string' ? tabParam : 'overview';

    if (!user) {
      return redirect("/login");
    }

    return (
      <div className="flex flex-col gap-8 pb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">API</h1>
          <p className="text-muted-foreground">
            Gerencie e monitore suas integrações com a API.
          </p>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full space-y-6">
          <TabsList className="w-full justify-start border-b pb-0 bg-transparent">
            <TabsTrigger value="overview" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="endpoints" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
              Endpoints
            </TabsTrigger>
            <TabsTrigger value="docs" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
              Documentação
            </TabsTrigger>
            <TabsTrigger value="limits" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
              Limites
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Suspense fallback={<LoadingUI />}>
              <ApiOverview userId={user.id} />
            </Suspense>
          </TabsContent>

          <TabsContent value="endpoints" className="space-y-4">
            <Suspense fallback={<LoadingUI />}>
              <ApiEndpoints userId={user.id} />
            </Suspense>
          </TabsContent>

          <TabsContent value="docs" className="space-y-4">
            <Suspense fallback={<LoadingUI />}>
              <ApiDocs userId={user.id} />
            </Suspense>
          </TabsContent>

          <TabsContent value="limits" className="space-y-4">
            <Suspense fallback={<LoadingUI />}>
              <ApiLimits userId={user.id} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    );
  } catch (error) {
    console.error("Erro ao carregar página de API:", error);
    return redirect("/login");
  }
} 