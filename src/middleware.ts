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
    const isAuthPage = req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/register')

    if (isOnDashboard && !isLoggedIn) {
        return Response.redirect(new URL('/login', req.nextUrl))
    }

    if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL('/dashboard', req.nextUrl))
    }
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
