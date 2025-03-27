"use client";

import { useState } from "react";
import { Search, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ApiEndpointsProps {
  userId: string;
}

export function ApiEndpoints({ userId }: ApiEndpointsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [openCategories, setOpenCategories] = useState<string[]>(["agents", "chat"]);

  // Definição de exemplos de endpoints da API
  const endpoints = [
    {
      category: "agents",
      name: "Agentes",
      items: [
        {
          method: "GET",
          path: "/agents",
          description: "Lista todos os agentes disponíveis",
          auth: true,
          rateLimited: true,
        },
        {
          method: "GET",
          path: "/agents/{id}",
          description: "Obtém detalhes de um agente específico",
          auth: true,
          rateLimited: true,
        },
        {
          method: "POST",
          path: "/agents",
          description: "Cria um novo agente",
          auth: true,
          rateLimited: true,
        },
        {
          method: "PUT",
          path: "/agents/{id}",
          description: "Atualiza um agente existente",
          auth: true,
          rateLimited: true,
        },
        {
          method: "DELETE",
          path: "/agents/{id}",
          description: "Remove um agente",
          auth: true,
          rateLimited: true,
        },
      ],
    },
    {
      category: "chat",
      name: "Chat",
      items: [
        {
          method: "POST",
          path: "/chat/start",
          description: "Inicia uma nova conversa",
          auth: true,
          rateLimited: true,
        },
        {
          method: "POST",
          path: "/chat/{chatId}/message",
          description: "Envia uma mensagem para um chat existente",
          auth: true,
          rateLimited: true,
        },
        {
          method: "GET",
          path: "/chat/{chatId}/messages",
          description: "Lista mensagens de um chat",
          auth: true,
          rateLimited: true,
        },
        {
          method: "GET",
          path: "/chat",
          description: "Lista todas as conversas",
          auth: true,
          rateLimited: true,
        },
      ],
    },
    {
      category: "knowledge",
      name: "Base de Conhecimento",
      items: [
        {
          method: "GET",
          path: "/knowledge",
          description: "Lista bases de conhecimento",
          auth: true,
          rateLimited: true,
        },
        {
          method: "POST",
          path: "/knowledge",
          description: "Cria uma nova base de conhecimento",
          auth: true,
          rateLimited: true,
        },
        {
          method: "GET",
          path: "/knowledge/{id}",
          description: "Obtém detalhes de uma base de conhecimento",
          auth: true,
          rateLimited: true,
        },
        {
          method: "PUT",
          path: "/knowledge/{id}",
          description: "Atualiza uma base de conhecimento",
          auth: true,
          rateLimited: true,
        },
        {
          method: "DELETE",
          path: "/knowledge/{id}",
          description: "Remove uma base de conhecimento",
          auth: true,
          rateLimited: true,
        },
        {
          method: "POST",
          path: "/knowledge/{id}/documents",
          description: "Adiciona um documento à base de conhecimento",
          auth: true,
          rateLimited: true,
        },
        {
          method: "GET",
          path: "/knowledge/{id}/documents",
          description: "Lista documentos de uma base de conhecimento",
          auth: true,
          rateLimited: true,
        },
      ],
    },
    {
      category: "workflows",
      name: "Workflows",
      items: [
        {
          method: "GET",
          path: "/workflows",
          description: "Lista workflows disponíveis",
          auth: true,
          rateLimited: true,
        },
        {
          method: "POST",
          path: "/workflows",
          description: "Cria um novo workflow",
          auth: true,
          rateLimited: true,
        },
        {
          method: "GET",
          path: "/workflows/{id}",
          description: "Obtém detalhes de um workflow",
          auth: true,
          rateLimited: true,
        },
        {
          method: "PUT",
          path: "/workflows/{id}",
          description: "Atualiza um workflow existente",
          auth: true,
          rateLimited: true,
        },
        {
          method: "DELETE",
          path: "/workflows/{id}",
          description: "Remove um workflow",
          auth: true,
          rateLimited: true,
        },
        {
          method: "POST",
          path: "/workflows/{id}/execute",
          description: "Executa um workflow",
          auth: true,
          rateLimited: true,
        },
      ],
    },
  ];

  const toggleCategory = (category: string) => {
    setOpenCategories((current) =>
      current.includes(category)
        ? current.filter((c) => c !== category)
        : [...current, category]
    );
  };

  const filteredEndpoints = searchTerm
    ? endpoints.map((category) => ({
        ...category,
        items: category.items.filter(
          (item) =>
            item.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.method.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      })).filter((category) => category.items.length > 0)
    : endpoints;

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-blue-100 text-blue-800";
      case "POST":
        return "bg-green-100 text-green-800";
      case "PUT":
        return "bg-yellow-100 text-yellow-800";
      case "DELETE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Endpoints da API</CardTitle>
        <CardDescription>
          Lista completa de endpoints disponíveis para sua integração
        </CardDescription>
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar endpoints..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredEndpoints.length === 0 && (
            <p className="text-center py-4 text-muted-foreground">
              Nenhum endpoint encontrado para sua busca.
            </p>
          )}
          
          {filteredEndpoints.map((category) => (
            <Collapsible
              key={category.category}
              open={openCategories.includes(category.category)}
              onOpenChange={() => toggleCategory(category.category)}
              className="border rounded-lg"
            >
              <CollapsibleTrigger asChild>
                <div className="flex justify-between items-center p-3 cursor-pointer hover:bg-muted/50 rounded-t-lg">
                  <h3 className="font-medium">{category.name}</h3>
                  <Button variant="ghost" size="sm">
                    {openCategories.includes(category.category) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-3 pb-3 pt-1 space-y-2">
                  {category.items.map((endpoint, index) => (
                    <div
                      key={index}
                      className="border rounded p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-wrap gap-2 items-center mb-2">
                        <Badge
                          className={`font-mono text-xs ${getMethodColor(endpoint.method)}`}
                        >
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm font-mono bg-muted px-1 py-0.5 rounded">
                          {endpoint.path}
                        </code>
                        {endpoint.auth && (
                          <Badge variant="outline" className="text-xs">
                            Auth
                          </Badge>
                        )}
                        {endpoint.rateLimited && (
                          <Badge variant="outline" className="text-xs">
                            Rate Limited
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {endpoint.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}

          <div className="flex justify-center mt-4">
            <Button variant="outline" asChild>
              <a href="/api?tab=docs" className="flex items-center">
                Ver documentação completa
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 