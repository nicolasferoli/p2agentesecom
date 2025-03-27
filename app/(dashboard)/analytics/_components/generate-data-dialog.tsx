'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2, PlusCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAgentAnalytics } from '@/hooks/use-agent-analytics';
import { createClient } from '@/lib/supabase/client';

interface GenerateDataDialogProps {
  userId: string;
}

export function GenerateDataDialog({ userId }: GenerateDataDialogProps) {
  const [open, setOpen] = useState(false);
  const [agents, setAgents] = useState<{ id: string; name: string }[]>([]);
  const [documents, setDocuments] = useState<{ id: string; name: string }[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { isGenerating, generateSampleData } = useAgentAnalytics();

  useEffect(() => {
    if (open) {
      fetchAgentsAndDocuments();
    }
  }, [open]);

  async function fetchAgentsAndDocuments() {
    setLoading(true);
    const supabase = createClient();

    try {
      // Buscar agentes
      const { data: agentsData, error: agentsError } = await supabase
        .from('agents')
        .select('id, name')
        .eq('user_id', userId);

      if (agentsError) throw agentsError;
      
      // Buscar documentos
      const { data: documentsData, error: documentsError } = await supabase
        .from('documents')
        .select('id, name')
        .eq('user_id', userId);

      if (documentsError) throw documentsError;

      setAgents(agentsData || []);
      setDocuments(documentsData || []);
      
      // Pré-selecionar todos
      setSelectedAgents(agentsData?.map(a => a.id) || []);
      setSelectedDocuments(documentsData?.map(d => d.id) || []);
    } catch (error) {
      console.error('Erro ao buscar agentes e documentos:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleCheckAgent = (agentId: string, checked: boolean) => {
    if (checked) {
      setSelectedAgents(prev => [...prev, agentId]);
    } else {
      setSelectedAgents(prev => prev.filter(id => id !== agentId));
    }
  };

  const handleCheckDocument = (documentId: string, checked: boolean) => {
    if (checked) {
      setSelectedDocuments(prev => [...prev, documentId]);
    } else {
      setSelectedDocuments(prev => prev.filter(id => id !== documentId));
    }
  };

  const handleGenerateData = async () => {
    if (selectedAgents.length === 0 || selectedDocuments.length === 0) {
      return;
    }

    await generateSampleData(userId, selectedAgents, selectedDocuments);
    setOpen(false);
  };

  const selectAllAgents = () => {
    setSelectedAgents(agents.map(a => a.id));
  };

  const selectAllDocuments = () => {
    setSelectedDocuments(documents.map(d => d.id));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Gerar Dados de Exemplo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gerar Dados de Analytics</DialogTitle>
          <DialogDescription>
            Selecione os agentes e documentos para os quais você deseja gerar dados de exemplo
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Carregando...</span>
          </div>
        ) : (
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Agentes</h3>
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={selectAllAgents}
                  disabled={agents.length === 0}
                >
                  Selecionar todos
                </Button>
              </div>
              {agents.length > 0 ? (
                <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-2">
                  {agents.map((agent) => (
                    <div key={agent.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`agent-${agent.id}`}
                        checked={selectedAgents.includes(agent.id)}
                        onCheckedChange={(checked) => 
                          handleCheckAgent(agent.id, checked as boolean)
                        }
                      />
                      <Label htmlFor={`agent-${agent.id}`}>{agent.name}</Label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Você ainda não tem agentes criados</p>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Documentos</h3>
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={selectAllDocuments}
                  disabled={documents.length === 0}
                >
                  Selecionar todos
                </Button>
              </div>
              {documents.length > 0 ? (
                <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`doc-${doc.id}`}
                        checked={selectedDocuments.includes(doc.id)}
                        onCheckedChange={(checked) => 
                          handleCheckDocument(doc.id, checked as boolean)
                        }
                      />
                      <Label htmlFor={`doc-${doc.id}`}>{doc.name}</Label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Você ainda não tem documentos</p>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button 
            disabled={
              isGenerating || 
              loading || 
              selectedAgents.length === 0 || 
              selectedDocuments.length === 0
            }
            onClick={handleGenerateData}
          >
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isGenerating ? 'Gerando...' : 'Gerar Dados'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 