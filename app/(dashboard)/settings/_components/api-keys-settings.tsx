"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Loader2, 
  Key, 
  Plus, 
  Copy, 
  Check, 
  Trash, 
  AlertTriangle,
  EyeOff,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { createClient } from "@/lib/supabase/client";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  last_used: string | null;
  enabled: boolean;
  created_at: string;
}

interface ApiKeysSettingsProps {
  userId: string;
}

export function ApiKeysSettings({ userId }: ApiKeysSettingsProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  async function fetchApiKeys() {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error("Erro ao buscar chaves API:", error);
      toast.error("Não foi possível carregar suas chaves de API");
    } finally {
      setIsLoading(false);
    }
  }

  async function createApiKey() {
    if (!newKeyName.trim()) {
      toast.error("Por favor, forneça um nome para a chave");
      return;
    }

    setIsCreating(true);
    try {
      const supabase = createClient();
      
      // Gerando uma chave com formato similar ao padrão de API keys
      const randomKey = `ecom_${generateRandomString(32)}`;
      
      const { data, error } = await supabase
        .from("api_keys")
        .insert({
          name: newKeyName.trim(),
          key: randomKey,
          user_id: userId,
          enabled: true,
        })
        .select()
        .single();

      if (error) throw error;

      setNewlyCreatedKey(randomKey);
      setIsCreating(false);
      setNewKeyName("");
      await fetchApiKeys();
      
      toast.success("Chave de API criada com sucesso");
    } catch (error) {
      console.error("Erro ao criar chave API:", error);
      toast.error("Ocorreu um erro ao criar a chave de API");
      setIsCreating(false);
    }
  }

  async function toggleApiKeyStatus(keyId: string, currentStatus: boolean) {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("api_keys")
        .update({ enabled: !currentStatus })
        .eq("id", keyId)
        .eq("user_id", userId);

      if (error) throw error;

      setApiKeys(
        apiKeys.map((key) =>
          key.id === keyId ? { ...key, enabled: !currentStatus } : key
        )
      );

      toast.success(`Chave ${!currentStatus ? "ativada" : "desativada"} com sucesso`);
    } catch (error) {
      console.error("Erro ao atualizar status da chave:", error);
      toast.error("Ocorreu um erro ao atualizar o status da chave");
    }
  }

  async function deleteApiKey(keyId: string) {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("api_keys")
        .delete()
        .eq("id", keyId)
        .eq("user_id", userId);

      if (error) throw error;

      setApiKeys(apiKeys.filter((key) => key.id !== keyId));
      toast.success("Chave de API excluída com sucesso");
    } catch (error) {
      console.error("Erro ao excluir chave API:", error);
      toast.error("Ocorreu um erro ao excluir a chave de API");
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function generateRandomString(length: number) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "Nunca";
    return format(new Date(dateStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  }

  function maskApiKey(key: string) {
    if (!key) return "";
    return `${key.substring(0, 7)}...${key.substring(key.length - 4)}`;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Chaves de API
        </CardTitle>
        <CardDescription>
          Gerencie suas chaves de API para integração com serviços externos
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {apiKeys.length === 0 ? (
              <div className="text-center py-8">
                <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-1">Nenhuma chave API</h3>
                <p className="text-muted-foreground mb-6">
                  Você ainda não criou nenhuma chave de API
                </p>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar chave API
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar nova chave API</DialogTitle>
                      <DialogDescription>
                        Dê um nome para identificar esta chave. Após a criação, guarde a chave em um local seguro.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label htmlFor="keyName" className="text-sm font-medium">
                          Nome da chave
                        </label>
                        <Input
                          id="keyName"
                          placeholder="Ex: Integração com minha loja"
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                        />
                      </div>
                      
                      {newlyCreatedKey && (
                        <div className="space-y-2 pt-4">
                          <label className="text-sm font-medium flex items-center text-amber-500">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Guarde esta chave! Ela não será mostrada novamente
                          </label>
                          <div className="flex">
                            <Input
                              readOnly
                              value={newlyCreatedKey}
                              type="text"
                              className="font-mono text-xs pr-20"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              className="absolute right-12 top-[13.3rem]"
                              onClick={() => copyToClipboard(newlyCreatedKey)}
                            >
                              {copied ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      {!newlyCreatedKey ? (
                        <>
                          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={createApiKey} disabled={isCreating}>
                            {isCreating ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Criando...
                              </>
                            ) : (
                              "Criar chave"
                            )}
                          </Button>
                        </>
                      ) : (
                        <Button onClick={() => {
                          setIsDialogOpen(false);
                          setNewlyCreatedKey(null);
                        }}>
                          Concluído
                        </Button>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <div className="space-y-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Chave</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Último uso</TableHead>
                      <TableHead>Criada em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((apiKey) => (
                      <TableRow key={apiKey.id}>
                        <TableCell className="font-medium">{apiKey.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs">
                              {showKey[apiKey.id] ? apiKey.key : maskApiKey(apiKey.key)}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => setShowKey({...showKey, [apiKey.id]: !showKey[apiKey.id]})}
                            >
                              {showKey[apiKey.id] ? (
                                <EyeOff className="h-3.5 w-3.5" />
                              ) : (
                                <Eye className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(apiKey.key)}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={apiKey.enabled ? "default" : "secondary"}>
                            {apiKey.enabled ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(apiKey.last_used)}</TableCell>
                        <TableCell>{formatDate(apiKey.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleApiKeyStatus(apiKey.id, apiKey.enabled)}
                            >
                              {apiKey.enabled ? "Desativar" : "Ativar"}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash className="h-4 w-4 mr-1" />
                                  Excluir
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir chave API</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação não pode ser desfeita. A chave será revogada permanentemente.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteApiKey(apiKey.id)}>
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar nova chave
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar nova chave API</DialogTitle>
                      <DialogDescription>
                        Dê um nome para identificar esta chave. Após a criação, guarde a chave em um local seguro.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label htmlFor="keyName" className="text-sm font-medium">
                          Nome da chave
                        </label>
                        <Input
                          id="keyName"
                          placeholder="Ex: Integração com minha loja"
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                        />
                      </div>
                      
                      {newlyCreatedKey && (
                        <div className="space-y-2 pt-4">
                          <label className="text-sm font-medium flex items-center text-amber-500">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Guarde esta chave! Ela não será mostrada novamente
                          </label>
                          <div className="flex">
                            <Input
                              readOnly
                              value={newlyCreatedKey}
                              type="text"
                              className="font-mono text-xs pr-20"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              className="absolute right-12 top-[13.3rem]"
                              onClick={() => copyToClipboard(newlyCreatedKey)}
                            >
                              {copied ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      {!newlyCreatedKey ? (
                        <>
                          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={createApiKey} disabled={isCreating}>
                            {isCreating ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Criando...
                              </>
                            ) : (
                              "Criar chave"
                            )}
                          </Button>
                        </>
                      ) : (
                        <Button onClick={() => {
                          setIsDialogOpen(false);
                          setNewlyCreatedKey(null);
                        }}>
                          Concluído
                        </Button>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <p className="text-sm text-muted-foreground">
          <AlertTriangle className="h-4 w-4 inline-block mr-1" />
          Mantenha suas chaves de API em segurança. Qualquer pessoa com sua chave terá acesso à API em seu nome.
        </p>
      </CardFooter>
    </Card>
  );
} 