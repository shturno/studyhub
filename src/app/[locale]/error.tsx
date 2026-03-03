"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error]", error.message, error.digest);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#04000a] text-[#00ff41] font-mono p-8">
      <AlertCircle className="w-16 h-16 mb-6" />
      <h1 className="text-4xl font-bold mb-2">ERRO DO SISTEMA</h1>

      <div className="max-w-md text-center mb-8">
        <p className="text-[#666] text-sm">
          {error.digest ? `ID: ${error.digest}` : "Erro desconhecido"}
        </p>
        <p className="text-[#999] mt-4 text-sm">
          Uma falha inesperada ocorreu. Tente novamente ou volte à página inicial.
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={reset}
          className="px-6 py-2 bg-[#00ff41] text-[#04000a] font-bold hover:bg-white transition-colors"
        >
          TENTAR NOVAMENTE
        </button>
        <Link
          href="/"
          className="px-6 py-2 border-2 border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-[#04000a] transition-colors"
        >
          VOLTAR AO INÍCIO
        </Link>
      </div>
    </div>
  );
}
