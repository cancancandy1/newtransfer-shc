"use client";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

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
        <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.95rem" }}>
          👤 {displayName}
        </span>

        <Link href="/admin" className="btn btn-outline-white">
          📋 ตารางทั้งหมด
        </Link>
        <Link href="/admin/report" className="btn btn-outline-white">
          📊 รายงานทั้งหมด
        </Link>

        {/* แสดงเฉพาะ role=ADMIN เท่านั้น */}
        {isAdmin && (
          <Link href="/admin/admins" className="btn btn-outline-white">
            👥 จัดการผู้ดูแล
          </Link>
        )}

        <button
          // onClick={() => signOut({ callbackUrl: `/login` })}
          onClick={() => signOut({ callbackUrl: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/login` })}
          className="btn btn-white"
        >
          ออกจากระบบ
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
    </nav>
  );
}
