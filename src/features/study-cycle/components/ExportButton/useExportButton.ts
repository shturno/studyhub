"use client";

import { useState } from "react";
import { toast } from "sonner";

export function useExportButton() {
  const [isExporting, setIsExporting] = useState(false);

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
        toast.success("Exportação concluída!");
      })
      .catch(() => {
        toast.error("Erro na exportação", {
          description: "Não foi possível exportar os dados.",
        });
      })
      .finally(() => setIsExporting(false));
  };

  return {
    isExporting,
    handleExport,
  };
}
