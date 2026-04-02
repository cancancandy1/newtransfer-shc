import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// auth.ts ใช้ใน Node.js runtime เท่านั้น (มี Prisma)
// callbacks ทั้งหมดอยู่ใน auth.config.ts เพื่อให้ middleware ใช้ได้ด้วย
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        // ดึงข้อมูล admin จาก database
        const admin = await prisma.admin.findUnique({
          where: { username: credentials.username as string },
        });

        if (!admin) return null;

        // ตรวจสอบรหัสผ่าน
        const isValid = await bcrypt.compare(
          credentials.password as string,
          admin.password_hash
        );

        if (!isValid) return null;

        // คืนค่า user object รวม firstname, lastname, role
        return {
          id: String(admin.id),
          name: `${admin.firstname} ${admin.lastname}`,
          firstname: admin.firstname,
          lastname: admin.lastname,
          role: admin.role as "ADMIN" | "STAFF",
        };
      },
    }),
  ],
});
