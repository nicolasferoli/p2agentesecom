"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyPromptState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-primary/10 p-4 rounded-full mb-4">
        <FileText className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Nenhum prompt encontrado</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        Prompts são templates de texto pré-definidos que podem ser utilizados
        com seus agentes. Crie seu primeiro prompt para começar.
      </p>
      <Button asChild>
        <Link href="/prompts/create">
          Criar Prompt
        </Link>
      </Button>
    </div>
  );
} 