"use client";

import { formatRelative } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { FileText, MoreHorizontal, Pencil, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Database } from "@/shared/types/database.types";

type Prompt = Database["public"]["Tables"]["prompts"]["Row"];

interface PromptListProps {
  prompts: Prompt[];
}

export function PromptList({ prompts }: PromptListProps) {
  const formatDate = (date: string | null) => {
    if (!date) return "Data desconhecida";
    
    return formatRelative(new Date(date), new Date(), {
      locale: ptBR,
    });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Última atualização</TableHead>
            <TableHead className="w-[80px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prompts.map((prompt) => (
            <TableRow key={prompt.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  {prompt.name}
                </div>
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {prompt.description || "Sem descrição"}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {prompt.tags?.length ? prompt.tags[0] : "Texto"}
                </Badge>
              </TableCell>
              <TableCell>
                {formatDate(prompt.updated_at)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Link
                        href={`/prompts/${prompt.id}`}
                        className="flex items-center gap-2"
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-2 text-destructive focus:text-destructive"
                    >
                      <Trash className="h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 