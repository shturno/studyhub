"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}) {
  useEffect(() => {
    console.error("NEXT.JS FATAL EXCEPTION INTERCEPTED:", error);
  }, [error]);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[500px] p-6 text-white m-8"
      style={{ border: "2px dashed #ff006e", backgroundColor: "#0a0005" }}
    >
      <AlertCircle className="w-16 h-16 text-[#ff006e] mb-4" />
      <h2 className="text-xl font-bold mb-4 font-pixel text-[#ff006e]">
        SYSTEM FAILURE
      </h2>
      <p className="mb-4 text-center font-mono">
        Um erro fatal ocorreu durante a renderização no servidor (Vercel). Envie
        um print desta tela.
      </p>

      <div
        className="w-full bg-black p-4 rounded overflow-auto text-left font-mono text-xs max-h-[300px]"
        style={{ border: "1px solid #333" }}
      >
        <p className="font-bold text-[#ff006e]">Message: {error.message}</p>
        {error.digest && (
          <p className="text-[#00ff41] mt-1">Digest: {error.digest}</p>
        )}
        {error.stack && (
          <p className="text-[#7f7f9f] mt-4 whitespace-pre-wrap">
            {error.stack}
          </p>
        )}
      </div>

      <button
        onClick={() => reset()}
        className="mt-6 px-4 py-2 font-pixel text-[10px] text-black bg-[#ff006e] hover:bg-white transition-colors"
      >
        REINICIAR SISTEMA
      </button>
    </div>
  );
}
