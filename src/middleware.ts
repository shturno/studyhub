import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import createMiddleware from 'next-intl/middleware'
import { NextResponse } from "next/server"
import type { NextRequest } from 'next/server'
import { locales } from '@/i18n/request'

const { auth } = NextAuth(authConfig)

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'pt',
  localePrefix: 'always'
})

export default auth((req) => {
    const intlResponse = intlMiddleware(req as NextRequest)
    
    const response = intlResponse || NextResponse.next()

    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')

    return response
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
