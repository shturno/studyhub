"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface ExportButtonProps {
  readonly children: ReactNode;
}

export function ExportButton({ children }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);

    await fetch("/api/stats/export")
      .then(async (response) => {
        if (!response.ok) throw new Error("Erro na exportação");
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `study-logs-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast({ title: "Exportação concluída!" });
      })
      .catch(() => {
        toast({
          title: "Erro na exportação",
          description: "Não foi possível exportar os dados.",
          variant: "destructive",
        });
      })
      .finally(() => setIsExporting(false));
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isExporting}
      className="contents"
    >
      {isExporting ? (
        <span className="flex items-center gap-2 pointer-events-none">
          <Loader2 className="h-4 w-4 animate-spin" />
          Exportando...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
