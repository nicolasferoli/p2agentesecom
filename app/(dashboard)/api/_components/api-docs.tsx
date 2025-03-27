"use client";

import { useState } from "react";
import { Code, Copy, Check, ExternalLink, Search } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

interface ApiDocsProps {
  userId: string;
}

export function ApiDocs({ userId }: ApiDocsProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const codeExamples = {
    node: `const axios = require('axios');

const API_KEY = 'seu-api-key-aqui';
const BASE_URL = 'https://api.example.com/v1';

async function listAgents() {
  try {
    const response = await axios.get(\`\${BASE_URL}/agents\`, {
      headers: {
        'Authorization': \`Bearer \${API_KEY}\`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao listar agentes:', error);
    throw error;
  }
}

listAgents();`,
    python: `import requests

API_KEY = 'seu-api-key-aqui'
BASE_URL = 'https://api.example.com/v1'

def list_agents():
    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    }
    
    response = requests.get(f'{BASE_URL}/agents', headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f'Erro: {response.status_code}')
        print(response.text)
        return None

agents = list_agents()
print(agents)`,
    curl: `curl -X GET "https://api.example.com/v1/agents" \\
  -H "Authorization: Bearer seu-api-key-aqui" \\
  -H "Content-Type: application/json"`,
  };

  // Exemplos de documentação da API
  const apiDocsSections = [
    {
      id: "introduction",
      title: "Introdução",
      content: (
        <div className="space-y-4">
          <p>
            Nossa API REST permite que você integre recursos de agentes, chat, base de conhecimento e workflows em suas próprias aplicações.
            Todas as solicitações usam SSL para criptografia de dados em trânsito.
          </p>
          <h4 className="text-lg font-medium">Autenticação</h4>
          <p>
            Para autenticar suas solicitações, inclua seu token de API como um cabeçalho Bearer em todas as solicitações:
          </p>
          <div className="bg-muted p-2 rounded font-mono text-sm">
            Authorization: Bearer seu-api-key-aqui
          </div>
        </div>
      ),
    },
    {
      id: "rate-limits",
      title: "Limites de Taxa",
      content: (
        <div className="space-y-4">
          <p>
            Para garantir a disponibilidade do serviço para todos os usuários, a API implementa os seguintes limites de taxa:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Plano Gratuito: 100 solicitações por hora</li>
            <li>Plano Básico: 1.000 solicitações por hora</li>
            <li>Plano Profissional: 10.000 solicitações por hora</li>
            <li>Plano Empresarial: 50.000 solicitações por hora</li>
          </ul>
          <p>
            Quando você excede o limite, receberá um erro 429 (Too Many Requests). Cabeçalhos de rate limit estão incluídos em cada resposta.
          </p>
        </div>
      ),
    },
    {
      id: "errors",
      title: "Erros",
      content: (
        <div className="space-y-4">
          <p>
            A API usa códigos de status HTTP padrão para indicar o sucesso ou falha de uma solicitação.
          </p>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Código</th>
                <th className="text-left p-2">Descrição</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2">200 - OK</td>
                <td className="p-2">Tudo funcionou conforme o esperado.</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">400 - Bad Request</td>
                <td className="p-2">A solicitação estava incorreta ou malformada.</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">401 - Unauthorized</td>
                <td className="p-2">Autenticação inválida ou ausente.</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">403 - Forbidden</td>
                <td className="p-2">Você não tem permissão para acessar este recurso.</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">404 - Not Found</td>
                <td className="p-2">O recurso solicitado não existe.</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">429 - Too Many Requests</td>
                <td className="p-2">Você excedeu o limite de taxa.</td>
              </tr>
              <tr>
                <td className="p-2">500, 502, 503, 504 - Server Errors</td>
                <td className="p-2">Algo deu errado no servidor.</td>
              </tr>
            </tbody>
          </table>
        </div>
      ),
    },
    {
      id: "agents",
      title: "Agentes",
      content: (
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Listar Agentes</h4>
          <p>Retorna uma lista de todos os agentes disponíveis para o usuário.</p>
          
          <div className="bg-muted p-2 rounded">
            <p className="font-medium">GET /agents</p>
          </div>
          
          <h5 className="font-medium mt-4">Parâmetros de consulta</h5>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Parâmetro</th>
                <th className="text-left p-2">Tipo</th>
                <th className="text-left p-2">Obrigatório</th>
                <th className="text-left p-2">Descrição</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2">limit</td>
                <td className="p-2">integer</td>
                <td className="p-2">Não</td>
                <td className="p-2">Número máximo de registros a retornar. Padrão: 10, Máximo: 100</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">offset</td>
                <td className="p-2">integer</td>
                <td className="p-2">Não</td>
                <td className="p-2">Número de registros a pular. Padrão: 0</td>
              </tr>
            </tbody>
          </table>
          
          <h5 className="font-medium mt-4">Exemplo de resposta</h5>
          <div className="bg-muted p-2 rounded font-mono text-xs overflow-auto max-h-40">
            {`{
  "data": [
    {
      "id": "agt_123456789",
      "name": "Assistente de Vendas",
      "description": "Assistente especializado em vendas",
      "created_at": "2023-01-15T14:22:31Z",
      "updated_at": "2023-01-15T14:22:31Z"
    },
    {
      "id": "agt_987654321",
      "name": "Suporte Técnico",
      "description": "Assistente para suporte técnico",
      "created_at": "2023-01-10T09:15:22Z",
      "updated_at": "2023-01-12T11:42:15Z"
    }
  ],
  "meta": {
    "total": 15,
    "limit": 10,
    "offset": 0
  }
}`}
          </div>
        </div>
      ),
    },
    {
      id: "chat",
      title: "Chat",
      content: (
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Iniciar Conversa</h4>
          <p>Inicia uma nova conversa com um agente específico.</p>
          
          <div className="bg-muted p-2 rounded">
            <p className="font-medium">POST /chat/start</p>
          </div>
          
          <h5 className="font-medium mt-4">Corpo da solicitação</h5>
          <div className="bg-muted p-2 rounded font-mono text-xs overflow-auto max-h-40">
            {`{
  "agent_id": "agt_123456789",
  "metadata": {
    "user_identifier": "cliente_abc123",
    "session_id": "sess_xyz789"
  }
}`}
          </div>
          
          <h5 className="font-medium mt-4">Exemplo de resposta</h5>
          <div className="bg-muted p-2 rounded font-mono text-xs overflow-auto max-h-40">
            {`{
  "data": {
    "id": "chat_456789123",
    "agent_id": "agt_123456789",
    "created_at": "2023-02-18T10:25:31Z",
    "updated_at": "2023-02-18T10:25:31Z",
    "metadata": {
      "user_identifier": "cliente_abc123",
      "session_id": "sess_xyz789"
    }
  }
}`}
          </div>
        </div>
      ),
    },
    {
      id: "knowledge",
      title: "Base de Conhecimento",
      content: (
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Listar Bases de Conhecimento</h4>
          <p>Retorna uma lista de todas as bases de conhecimento disponíveis para o usuário.</p>
          
          <div className="bg-muted p-2 rounded">
            <p className="font-medium">GET /knowledge</p>
          </div>
          
          <h5 className="font-medium mt-4">Exemplo de resposta</h5>
          <div className="bg-muted p-2 rounded font-mono text-xs overflow-auto max-h-40">
            {`{
  "data": [
    {
      "id": "kb_123456789",
      "name": "Documentação de Produtos",
      "description": "Base de conhecimento com informações sobre produtos",
      "created_at": "2023-01-15T14:22:31Z",
      "updated_at": "2023-01-15T14:22:31Z"
    },
    {
      "id": "kb_987654321",
      "name": "FAQ Suporte",
      "description": "Perguntas frequentes de suporte técnico",
      "created_at": "2023-01-10T09:15:22Z",
      "updated_at": "2023-01-12T11:42:15Z"
    }
  ],
  "meta": {
    "total": 5,
    "limit": 10,
    "offset": 0
  }
}`}
          </div>
        </div>
      ),
    },
    {
      id: "workflows",
      title: "Workflows",
      content: (
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Executar Workflow</h4>
          <p>Executa um workflow específico com os parâmetros fornecidos.</p>
          
          <div className="bg-muted p-2 rounded">
            <p className="font-medium">POST /workflows/{"{id}"}/execute</p>
          </div>
          
          <h5 className="font-medium mt-4">Corpo da solicitação</h5>
          <div className="bg-muted p-2 rounded font-mono text-xs overflow-auto max-h-40">
            {`{
  "input": {
    "customer_id": "cust_123",
    "product_id": "prod_456",
    "quantity": 2
  },
  "metadata": {
    "source": "website",
    "session_id": "sess_xyz789"
  }
}`}
          </div>
          
          <h5 className="font-medium mt-4">Exemplo de resposta</h5>
          <div className="bg-muted p-2 rounded font-mono text-xs overflow-auto max-h-40">
            {`{
  "data": {
    "execution_id": "exec_123456789",
    "workflow_id": "wf_987654321",
    "status": "completed",
    "result": {
      "order_created": true,
      "order_id": "ord_789123",
      "total_amount": 199.98
    },
    "created_at": "2023-03-10T15:22:31Z",
    "completed_at": "2023-03-10T15:22:35Z"
  }
}`}
          </div>
        </div>
      ),
    },
  ];

  const filteredSections = searchTerm
    ? apiDocsSections.filter((section) =>
        section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : apiDocsSections;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Documentação da API</CardTitle>
          <CardDescription>Referência completa para integrar com nossa API</CardDescription>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar na documentação..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="node" className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Exemplos de Código</h3>
              <TabsList>
                <TabsTrigger value="node">Node.js</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="curl">cURL</TabsTrigger>
              </TabsList>
            </div>

            {Object.entries(codeExamples).map(([lang, code]) => (
              <TabsContent key={lang} value={lang} className="relative">
                <div className="bg-muted rounded-md p-4 relative">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-2 h-8 w-8"
                    onClick={() => copyToClipboard(code, lang)}
                  >
                    {copied === lang ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <pre className="text-xs font-mono overflow-auto max-h-56">
                    <code>{code}</code>
                  </pre>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="space-y-8">
            {filteredSections.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">
                Nenhum resultado encontrado para "{searchTerm}".
              </p>
            ) : (
              filteredSections.map((section) => (
                <div key={section.id} id={section.id} className="scroll-mt-16">
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                    {section.title}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      asChild
                    >
                      <Link href={`#${section.id}`}>
                        <Code className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </h3>
                  {section.content}
                </div>
              ))
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t flex justify-between">
          <p className="text-sm text-muted-foreground">
            Última atualização: 15 de março de 2023
          </p>
          <Button variant="outline" size="sm" asChild>
            <a href="https://example.com/api/docs" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
              Documentação expandida
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 