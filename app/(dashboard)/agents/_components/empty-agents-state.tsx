"use client";

import Link from "next/link";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyAgentsState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted p-6 mb-6">
        <Bot className="h-12 w-12 text-primary" />
      </div>
      
      <h2 className="text-2xl font-bold mb-2">Nenhum agente criado</h2>
      
      <p className="text-muted-foreground max-w-md mb-8">
        Você ainda não criou nenhum agente inteligente. Crie seu primeiro agente para começar a construir assistentes personalizados para suas necessidades.
      </p>
      
      <Button asChild size="lg">
        <Link href="/agents/create">
          Criar seu primeiro agente
        </Link>
      </Button>
    </div>
  );
}