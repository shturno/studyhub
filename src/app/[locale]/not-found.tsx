import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#04000a] text-[#00ff41] font-mono p-8">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-2xl font-bold mb-8">PÁGINA NÃO ENCONTRADA</p>

      <p className="text-[#999] text-center max-w-md mb-8">
        A página que você procura não existe ou foi removida. Verifique a URL e tente novamente.
      </p>

      <Link
        href="/"
        className="px-6 py-2 bg-[#00ff41] text-[#04000a] font-bold hover:bg-white transition-colors"
      >
        VOLTAR AO INÍCIO
      </Link>
    </div>
  );
}
