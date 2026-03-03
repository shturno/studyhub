"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2, ExternalLink, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { deleteEditorialItem } from "../actions";
import type { EditorialWithMappings } from "../types";

interface EditorialListProps {
  editorials: EditorialWithMappings[];
  onSelectEdito?: (editorial: EditorialWithMappings) => void;
}

export function EditorialList({
  editorials,
  onSelectEdito,
}: EditorialListProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (editorials.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <AlertCircle className="w-12 h-12 text-zinc-500 mb-4" />
        <h3 className="text-lg font-semibold text-zinc-200 mb-2">
          Nenhum edital adicionado
        </h3>
        <p className="text-zinc-400 text-sm">
          Adicione um edital para começar a mapear o conteúdo
        </p>
      </div>
    );
  }

  async function handleDelete(id: string) {
    try {
      await deleteEditorialItem(id);
      toast.success("Edital removido com sucesso");
      router.refresh();
    } catch {
      toast.error("Erro ao remover edital");
    }
    setDeleteId(null);
  }

  return (
    <div className="space-y-4">
      {editorials.map((editorial) => (
        <Card
          key={editorial.id}
          className="p-4 bg-card/50 border-white/10 hover:border-white/20 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div
              className="flex-1 cursor-pointer"
              onClick={() => onSelectEdito?.(editorial)}
            >
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-white text-lg">
                  {editorial.title}
                </h3>
                {editorial.url && (
                  <a
                    href={editorial.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 text-indigo-400 hover:text-indigo-300" />
                  </a>
                )}
              </div>
              {editorial.description && (
                <p className="text-sm text-zinc-400 mb-2">
                  {editorial.description}
                </p>
              )}
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {editorial.contentMappings?.length || 0} mapeamentos
                </Badge>
                <span className="text-xs text-zinc-500">
                  Adicionado em{" "}
                  {format(new Date(editorial.uploadedAt), "dd MMM yyyy", {
                    locale: ptBR,
                  })}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteId(editorial.id)}
              className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ))}

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Edital?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todos os mapeamentos de conteúdo
              também serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
