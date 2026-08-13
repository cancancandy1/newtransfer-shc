import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// proxy (formerly middleware) ใช้ authConfig (ไม่มี Prisma) — ทำงานได้ใน Edge runtime
export default NextAuth(authConfig).auth;

export const config = {
  // Next.js strip basePath ออกก่อนส่งให้ middleware
  // ดังนั้น matcher ใช้แค่ path หลัง /new-transfer เท่านั้น
  matcher: [
    "/admin/:path*",
    "/api/auth/:path*",
  ],
};
