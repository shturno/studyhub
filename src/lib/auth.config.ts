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
            // Initial sign in
            if (user) {
                token.id = user.id;
                token.email = user.email;
            }
            return token;
        }
    },
    providers: [], // Providers allocated in the main auth file
} satisfies NextAuthConfig
