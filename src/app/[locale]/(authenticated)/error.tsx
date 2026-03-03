"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function AuthenticatedErrorBoundary({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}) {
  useEffect(() => {
    console.error("[Authenticated Area Error]", error.message, error.digest);
  }, [error]);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[600px] p-6 text-[#00ff41] m-8"
      style={{ border: "2px dashed #ff006e", backgroundColor: "#0a0005" }}
    >
      <AlertCircle className="w-16 h-16 text-[#ff006e] mb-4" />
      <h2 className="text-3xl font-bold mb-4 font-mono text-[#ff006e]">
        FALHA DO SISTEMA
      </h2>
      <p className="mb-6 text-center font-mono text-sm text-[#999] max-w-md">
        Ocorreu um erro ao tentar carregar esta página. Tente novamente.
      </p>

      {error.digest && (
        <p className="text-[#00ff41] text-xs mb-6">
          ID do Erro: {error.digest}
        </p>
      )}

      <button
        onClick={() => reset()}
        className="px-6 py-2 font-mono text-sm text-black bg-[#ff006e] hover:bg-white transition-colors"
      >
        REINICIAR
      </button>
    </div>
  );
}
