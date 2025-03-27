import Link from "next/link";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[80vh] py-16 text-center">
      <div className="rounded-full bg-muted p-6 mb-6">
        <Search className="h-12 w-12 text-muted-foreground" />
      </div>
      
      <h1 className="text-4xl font-bold mb-2">Página não encontrada</h1>
      
      <p className="text-muted-foreground max-w-md mb-8">
        A página que você está procurando não existe ou foi removida.
      </p>
      
      <div className="flex gap-4">
        <Button asChild variant="outline">
          <Link href="/agents">
            Ir para Agentes
          </Link>
        </Button>
        
        <Button asChild>
          <Link href="/">
            Página Inicial
          </Link>
        </Button>
      </div>
    </div>
  );
} 