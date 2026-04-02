// ขยาย type ของ NextAuth เพื่อรองรับข้อมูล admin เพิ่มเติม
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      firstname: string;
      lastname: string;
      role: "ADMIN" | "STAFF";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    firstname: string;
    lastname: string;
    role: "ADMIN" | "STAFF";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    firstname: string;
    lastname: string;
    role: "ADMIN" | "STAFF";
  }
}
