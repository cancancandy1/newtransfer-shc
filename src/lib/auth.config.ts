import type { NextAuthConfig } from "next-auth";

// Base auth config — ใช้ทั้งใน middleware (Edge) และ auth.ts (Node.js)
// ห้าม import Prisma ที่นี่ เพราะ Edge runtime ไม่รองรับ
export const authConfig: NextAuthConfig = {
  trustHost: true,
  basePath: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/auth`,
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    // ตรวจสอบสิทธิ์เข้าถึง — ทำงานใน Edge middleware
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminPage = nextUrl.pathname.startsWith("/admin");

      // ถ้าไม่ได้ login ให้ redirect ไปหน้า login
      if (isAdminPage && !isLoggedIn) return false;

      // ตรวจสอบ RBAC: เฉพาะ role=ADMIN ที่เข้า /admin/admins ได้
      if (nextUrl.pathname.startsWith("/admin/admins")) {
        const role = (auth?.user as { role?: string })?.role;
        if (role !== "ADMIN") {
          return Response.redirect(new URL("/admin", nextUrl));
        }
      }

      return true;
    },

    // บันทึก firstname, lastname, role ลง JWT token (ปลอดภัยใน Edge)
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

    // ส่ง firstname, lastname, role ไปยัง session object (ปลอดภัยใน Edge)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    session({ session, token }: { session: any; token: any }) {
      session.user.id = token.id as string;
      session.user.firstname = token.firstname as string;
      session.user.lastname = token.lastname as string;
      session.user.role = token.role as "ADMIN" | "STAFF";
      return session;
    },
  },
  providers: [], // providers อยู่ใน auth.ts (Node.js only)
};
