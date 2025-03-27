"use client";

import Link from "next/link";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyWorkflowState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-primary/10 p-4 rounded-full mb-4">
        <Share2 className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Nenhum fluxo de trabalho criado</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        Fluxos de trabalho permitem automatizar tarefas com seus agentes.
        Crie seu primeiro fluxo para começar a automatizar processos.
      </p>
      <Button asChild>
        <Link href="/workflow/create">
          Criar Fluxo de Trabalho
        </Link>
      </Button>
    </div>
  );
} 