import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// proxy (formerly middleware) ใช้ authConfig (ไม่มี Prisma) — ทำงานได้ใน Edge runtime
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/admin/:path*", "/api/auth/:path*"],
};
