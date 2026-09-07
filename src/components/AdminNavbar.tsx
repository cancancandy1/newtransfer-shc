"use client";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

// ==========================================
// 🎨 Heroicons (https://heroicons.com/)
// สามารถเปลี่ยน Icon ได้ง่ายๆ โดยเปลี่ยนชื่อ Import จาก @heroicons/react/24/outline หรือ /24/solid
// ==========================================
import {
  UserIcon,
  TableCellsIcon,
  ChartBarIcon,
  UserGroupIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function AdminNavbar() {
  const { data: session } = useSession();

  // แสดงชื่อผู้ดูแล
  const displayName =
    session?.user?.firstname && session?.user?.lastname
      ? `${session.user.firstname} ${session.user.lastname}`
      : session?.user?.name ?? "ผู้ดูแลระบบ";

  // ตรวจสอบ role สำหรับแสดง link เพิ่มเติม
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <nav className="navbar">
      <Link href="/admin" className="navbar-brand">
        SHC Transfer
        <span style={{ fontSize: "1rem", fontWeight: "normal" }}>ผู้ดูแลระบบ</span>
      </Link>
      <div className="navbar-actions">
        {/* แสดงชื่อผู้ดูแล */}
        <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.95rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
          <UserIcon style={{ width: "1.2rem", height: "1.2rem" }} />
          {displayName}
        </span>

        {/* ปุ่มตารางทั้งหมด */}
        <Link href="/admin" className="btn btn-outline-white" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
          <TableCellsIcon style={{ width: "1.1rem", height: "1.1rem" }} />
          ตารางทั้งหมด
        </Link>

        {/* ปุ่มรายงานทั้งหมด */}
        <Link href="/admin/report" className="btn btn-outline-white" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
          <ChartBarIcon style={{ width: "1.1rem", height: "1.1rem" }} />
          รายงานทั้งหมด
        </Link>

        {/* แสดงเฉพาะ role=ADMIN เท่านั้น */}
        {isAdmin && (
          <Link href="/admin/admins" className="btn btn-outline-white" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
            <UserGroupIcon style={{ width: "1.1rem", height: "1.1rem" }} />
            จัดการผู้ดูแล
          </Link>
        )}

        <button
          onClick={() => signOut({ callbackUrl: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/login` })}
          className="btn btn-white"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
        >
          ออกจากระบบ
          <ArrowRightStartOnRectangleIcon style={{ width: "1.1rem", height: "1.1rem" }} />
        </button>
      </div>
    </nav>
  );
}

