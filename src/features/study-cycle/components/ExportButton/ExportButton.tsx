"use client";

import { Loader2 } from "lucide-react";
import { useExportButton } from "./useExportButton";
import type { ExportButtonProps } from "./types";

export function ExportButton({ children }: ExportButtonProps) {
  const { isExporting, handleExport } = useExportButton();

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
