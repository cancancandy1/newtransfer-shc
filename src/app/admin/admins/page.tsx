import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdmins } from "@/app/actions/admin";
import AdminsClient from "./AdminsClient";

// หน้า Admin Management — เฉพาะ ADMIN เท่านั้น
export default async function AdminsPage() {
  const session = await auth();

  // ถ้าไม่ใช่ ADMIN ให้ redirect กลับ
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  // ดึงรายชื่อ admin ทั้งหมด
  const admins = await getAdmins();

  return <AdminsClient admins={admins} />;
}
