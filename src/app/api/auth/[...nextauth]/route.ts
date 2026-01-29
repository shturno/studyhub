import { authOptions } from "@/lib/auth"

// Exportando handlers diretamente sem chamar NextAuth
// NextAuth v5 beta tem problemas de tipos, usando workaround
export async function GET(request: Request) {
    // Placeholder - NextAuth v5 beta
    return new Response(JSON.stringify({ error: "Not implemented" }), {
        status: 501,
        headers: { 'Content-Type': 'application/json' }
    })
}

export async function POST(request: Request) {
    // Placeholder - NextAuth v5 beta
    return new Response(JSON.stringify({ error: "Not implemented" }), {
        status: 501,
        headers: { 'Content-Type': 'application/json' }
    })
}
