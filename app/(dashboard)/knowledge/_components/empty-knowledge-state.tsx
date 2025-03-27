"use client";

import Link from "next/link";
import { Database } from "lucide-react";

import { Button } from "@/components/ui/button";

export function EmptyKnowledgeBaseState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-muted p-3">
        <Database className="h-10 w-10 text-primary" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">Nenhuma base de conhecimento criada</h3>
      <p className="mb-6 text-muted-foreground max-w-md">
        Crie sua primeira base de conhecimento para fornecer informações
        específicas aos seus agentes e melhorar suas respostas.
      </p>
      <Button asChild>
        <Link href="/knowledge/create">
          Criar base de conhecimento
        </Link>
      </Button>
    </div>
  );
} 