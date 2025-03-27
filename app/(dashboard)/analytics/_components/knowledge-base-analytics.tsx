"use client";

import { useState, useEffect } from "react";
import { Loader2, BookOpen, FileText, CalendarClock, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

interface KnowledgeBaseAnalyticsProps {
  userId: string;
}

export function KnowledgeBaseAnalytics({ userId }: KnowledgeBaseAnalyticsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [kbData, setKbData] = useState<{
    totalKnowledgeBases: number;
    totalDocuments: number;
    averageDocumentsPerKB: number;
    documentsByType: { name: string; value: number }[];
    recentDocuments: any[];
    popularKnowledgeBases: any[];
  }>({
    totalKnowledgeBases: 0,
    totalDocuments: 0,
    averageDocumentsPerKB: 0,
    documentsByType: [],
    recentDocuments: [],
    popularKnowledgeBases: []
  });

  useEffect(() => {
    async function fetchKnowledgeBaseAnalytics() {
      setIsLoading(true);
      try {
        const supabase = createClient();
        
        // Buscar contagem de bases de conhecimento
        const { count: kbCount, error: kbError } = await supabase
          .from("knowledge_base")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId);
        
        // Simular a contagem de documentos
        const docsCount = Math.floor(Math.random() * 50) + 10; // Valor simulado
        
        // Simular bases de conhecimento populares
        const mockKnowledgeBases = [
          { id: "1", name: "Produtos", description: "Informações sobre produtos", docs_count: 15 },
          { id: "2", name: "Suporte", description: "Documentação de suporte", docs_count: 12 },
          { id: "3", name: "Vendas", description: "Material de vendas", docs_count: 8 },
          { id: "4", name: "Marketing", description: "Materiais de marketing", docs_count: 7 },
          { id: "5", name: "Técnico", description: "Documentos técnicos", docs_count: 5 }
        ];
        
        // Simular documentos recentes
        const mockRecentDocs = Array.from({ length: 7 }).map((_, i) => {
          const types = ["pdf", "docx", "txt", "csv"];
          const statuses = ["processed", "processing", "pending"];
          const date = new Date();
          date.setDate(date.getDate() - i);
          
          return {
            id: `doc-${i + 1}`,
            name: `Documento ${i + 1}`,
            description: `Descrição do documento ${i + 1}`,
            file_type: types[Math.floor(Math.random() * types.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            created_at: date.toISOString(),
            updated_at: date.toISOString(),
            knowledge_base: { name: mockKnowledgeBases[Math.floor(Math.random() * mockKnowledgeBases.length)].name }
          };
        });
          
        // Distribuição de tipos de documentos
        const documentTypes = [
          { name: "PDF", value: Math.floor(docsCount * 0.6) },
          { name: "DOCX", value: Math.floor(docsCount * 0.2) },
          { name: "TXT", value: Math.floor(docsCount * 0.1) },
          { name: "CSV", value: Math.floor(docsCount * 0.05) },
          { name: "Outros", value: Math.floor(docsCount * 0.05) }
        ];
        
        setKbData({
          totalKnowledgeBases: kbCount || 0,
          totalDocuments: docsCount,
          averageDocumentsPerKB: kbCount ? docsCount / kbCount : 0,
          documentsByType: documentTypes,
          recentDocuments: mockRecentDocs,
          popularKnowledgeBases: mockKnowledgeBases
        });
      } catch (error) {
        console.error("Erro ao buscar dados de análise de bases de conhecimento:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchKnowledgeBaseAnalytics();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Cores para os gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      {/* Cards com métricas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Total de Bases de Conhecimento</div>
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold">{kbData.totalKnowledgeBases}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Total de Documentos</div>
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold">{kbData.totalDocuments}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Média de Documentos por Base</div>
              <CalendarClock className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold">
              {Math.round(kbData.averageDocumentsPerKB)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Gráfico de tipos de documento */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos por Tipo</CardTitle>
            <CardDescription>
              Distribuição dos tipos de documentos nas bases de conhecimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={kbData.documentsByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {kbData.documentsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} documentos`, 'Quantidade']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bases de conhecimento populares */}
        <Card>
          <CardHeader>
            <CardTitle>Bases de Conhecimento Populares</CardTitle>
            <CardDescription>
              Bases de conhecimento com mais documentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={kbData.popularKnowledgeBases}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={150}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip formatter={(value) => [`${value} documentos`, 'Quantidade']} />
                  <Bar dataKey="docs_count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documentos recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos Recentes</CardTitle>
          <CardDescription>
            Os últimos documentos adicionados às bases de conhecimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Base de Conhecimento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Criação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kbData.recentDocuments.length > 0 ? (
                  kbData.recentDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        {doc.name}
                      </TableCell>
                      <TableCell>{doc.knowledge_base?.name || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="uppercase">
                          {doc.file_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={doc.status === "processed" ? "default" : doc.status === "processing" ? "outline" : "secondary"}
                          className="capitalize"
                        >
                          {doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(doc.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      Nenhum documento encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 