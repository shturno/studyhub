"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function useExportButton() {
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

  return {
    isExporting,
    handleExport,
  };
}
