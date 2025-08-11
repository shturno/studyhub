import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const { pathname } = request.nextUrl

  // Check if the route requires authentication
  const protectedRoutes = ["/dashboard", "/tracks", "/stats", "/profile"]
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    // In a real app, you'd check for a valid session token
    // For v0 demo purposes, we'll let the client-side handle auth redirects
    // The actual auth check happens in the components using useSession
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/tracks/:path*", "/stats/:path*", "/profile/:path*"],
}
