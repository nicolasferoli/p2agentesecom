"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

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
import { Button } from "@/components/ui/button";

interface DeleteKnowledgeButtonProps {
  knowledgeBaseId: string;
  knowledgeBaseName: string;
}

export function DeleteKnowledgeButton({
  knowledgeBaseId,
  knowledgeBaseName,
}: DeleteKnowledgeButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      // Deletar a base de conhecimento
      const { error } = await supabase
        .from("knowledge_base")
        .delete()
        .eq("id", knowledgeBaseId);

      if (error) {
        throw error;
      }

      toast.success("Base de conhecimento excluída com sucesso");
      router.refresh();
      router.push("/knowledge");
    } catch (error) {
      console.error("Erro ao excluir base de conhecimento:", error);
      toast.error("Erro ao excluir base de conhecimento");
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            setIsOpen(true);
          }}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Base de Conhecimento</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a base de conhecimento{" "}
            <span className="font-medium text-foreground">
              &quot;{knowledgeBaseName}&quot;
            </span>
            ? Esta ação não pode ser desfeita e todos os documentos associados também serão excluídos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 