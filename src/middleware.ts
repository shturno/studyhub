import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import type { NextRequest } from "next/server"

import { Session } from "next-auth"

interface NextAuthRequest extends NextRequest {
    auth: Session | null
}

const { auth } = NextAuth(authConfig)

export default auth(async (req) => {
    const isLoggedIn = !!req.auth
    const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')

    if (isOnDashboard && !isLoggedIn) {
        return Response.redirect(new URL('/login', req.nextUrl))
    }
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
