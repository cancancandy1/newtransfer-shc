"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link href="" className="navbar-brand">
        SHC Transfer
        <span style={{ fontSize: "1rem",fontWeight: "normal" }}>ระบบชำระค่าสมาชิก</span>
      </Link>
      <div className="navbar-actions">
        <Link href="/login" className="btn btn-white">
          🔑 Sign In
        </Link>
      </div>
    </nav>
  );
}
