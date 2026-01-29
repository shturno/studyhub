// Middleware simplificado - sem NextAuth middleware
export default function middleware() {
    return null
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/study/:path*",
        "/subjects/:path*",
        "/profile/:path*",
        "/contests/:path*"
    ]
}
