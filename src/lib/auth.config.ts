import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
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
      const pathname = nextUrl.pathname;

      const publicPaths = ["/login", "/register"];
      const isPublicPath = publicPaths.some((p) => pathname.includes(p));

      if (isPublicPath) {
        return true;
      }

      const protectedSegments = [
        "/dashboard",
        "/contests",
        "/subjects",
        "/study",
        "/planner",
        "/settings",
        "/gamification",
        "/reviews",
        "/timer",
        "/insights",
        "/materials",
      ];

      const isProtectedPath = protectedSegments.some((seg) =>
        pathname.includes(seg),
      );

      if (isProtectedPath) {
        return isLoggedIn;
      }

      return true;
    },
  },
  session: { strategy: "jwt" },
  providers: [],
} satisfies NextAuthConfig;
