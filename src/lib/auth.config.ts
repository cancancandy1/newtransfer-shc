import type { NextAuthConfig } from "next-auth";
import { authCookies } from "@/lib/authCookies";

// Base path of the app
const BASE_PATH = "/new-transfer";

// Base auth config - used in middleware (Edge) and auth.ts (Node.js)
export const authConfig: NextAuthConfig = {
  trustHost: true,
  basePath: "/api/auth",
  cookies: authCookies,
  pages: {
    // Next.js will automatically prepend basePath -> /new-transfer/login
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    // Check access rights - runs in Edge middleware
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminPage = nextUrl.pathname.startsWith("/admin");

      // If not logged in, redirect to login
      if (isAdminPage && !isLoggedIn) return false;

      // Check RBAC: only role=ADMIN can access /admin/admins
      if (nextUrl.pathname.startsWith("/admin/admins")) {
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const role = (auth?.user as any)?.role;
        if (role !== "ADMIN") {
          // redirect back to /admin
          return Response.redirect(new URL(`${BASE_PATH}/admin`, nextUrl.origin));
        }
      }

      return true;
    },

    // Save user info to JWT token
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.firstname = user.firstname;
        token.lastname = user.lastname;
        token.role = user.role;
      }
      return token;
    },

    // Send user info to session object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    session({ session, token }: { session: any; token: any }) {
      session.user.id = token.id as string;
      session.user.firstname = token.firstname as string;
      session.user.lastname = token.lastname as string;
      session.user.role = token.role as "ADMIN" | "STAFF";
      return session;
    },
  },
  providers: [], // providers are in auth.ts (Node.js only)
};
