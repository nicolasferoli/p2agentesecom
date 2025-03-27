"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface DeleteAgentButtonProps {
  id: string;
}

export function DeleteAgentButton({ id }: DeleteAgentButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);

    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast.success("Agente excluído com sucesso!");
      setIsDialogOpen(false);
      router.push("/agents");
      router.refresh();
    } catch (error) {
      console.error("Erro ao excluir agente:", error);
      toast.error("Ocorreu um erro ao excluir o agente. Tente novamente.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir Agente
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tem certeza?</DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. Esta ação excluirá permanentemente o agente
            e todas as conversas relacionadas a ele.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-between sm:justify-end gap-2 mt-2">
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 