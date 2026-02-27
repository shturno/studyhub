import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub
            }
            return session
        },
        async jwt({ token, user }) {

            if (user) {
                token.id = user.id;
                token.email = user.email;
            }
            return token;
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.includes('/dashboard');

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false;
            }

            return true;
        }
    },
    session: { strategy: "jwt" },
    providers: [],
} satisfies NextAuthConfig
