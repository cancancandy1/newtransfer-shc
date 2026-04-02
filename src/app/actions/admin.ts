"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminRole } from "@prisma/client";
import bcrypt from "bcryptjs";

// ตรวจสอบว่า session มี role=ADMIN ก่อนทำ action
async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("ไม่ได้เข้าสู่ระบบ");
  if (session.user.role !== "ADMIN") throw new Error("ไม่มีสิทธิ์ดำเนินการนี้");
  return session;
}

// ดึงรายชื่อ admin ทั้งหมด (เฉพาะ ADMIN)
export async function getAdmins() {
  await requireAdmin();
  return prisma.admin.findMany({
    select: {
      id: true,
      firstname: true,
      lastname: true,
      username: true,
      role: true,
      created_at: true,
    },
    orderBy: { created_at: "asc" },
  });
}

// สร้าง admin ใหม่ (เฉพาะ ADMIN สร้างได้เฉพาะ STAFF)
export async function createAdmin(data: {
  firstname: string;
  lastname: string;
  username: string;
  password: string;
  role: AdminRole;
}) {
  await requireAdmin();

  // ตรวจสอบว่า username ซ้ำหรือไม่
  const existing = await prisma.admin.findUnique({ where: { username: data.username } });
  if (existing) throw new Error("ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว");

  // เข้ารหัสรหัสผ่าน (bcrypt)
  const password_hash = await bcrypt.hash(data.password, 12);

  return prisma.admin.create({
    data: {
      firstname: data.firstname.trim(),
      lastname: data.lastname.trim(),
      username: data.username.trim(),
      password_hash,
      role: data.role,
    },
  });
}

// แก้ไขข้อมูล admin (เฉพาะ ADMIN)
export async function updateAdmin(
  id: number,
  data: {
    firstname: string;
    lastname: string;
    username: string;
    role: AdminRole;
  }
) {
  await requireAdmin();

  // ตรวจสอบว่า username ซ้ำกับคนอื่นหรือไม่
  const existing = await prisma.admin.findFirst({
    where: { username: data.username, NOT: { id } },
  });
  if (existing) throw new Error("ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว");

  return prisma.admin.update({
    where: { id },
    data: {
      firstname: data.firstname.trim(),
      lastname: data.lastname.trim(),
      username: data.username.trim(),
      role: data.role,
    },
  });
}

// ลบ admin (เฉพาะ ADMIN)
export async function deleteAdmin(id: number) {
  const session = await requireAdmin();

  // ป้องกันการลบตัวเอง
  if (String(id) === session.user.id) {
    throw new Error("ไม่สามารถลบบัญชีของตัวเองได้");
  }

  return prisma.admin.delete({ where: { id } });
}

// รีเซ็ตรหัสผ่าน admin (เฉพาะ ADMIN)
export async function resetAdminPassword(id: number, password: string) {
  await requireAdmin();

  // ตรวจสอบความยาวรหัสผ่าน
  if (password.length < 6) throw new Error("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");

  // เข้ารหัสรหัสผ่านใหม่
  const hashed = await bcrypt.hash(password, 12);

  return prisma.admin.update({
    where: { id },
    data: { password_hash: hashed },
  });
}
