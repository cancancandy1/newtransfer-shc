"use client";
import Link from "next/link";
import { ArrowRightEndOnRectangleIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        SHC Transfer
        <span style={{ fontSize: "1rem", fontWeight: "normal" }}>ระบบชำระค่าสมาชิก</span>
      </Link>
      <div className="navbar-actions">
        <Link href="/login" className="btn btn-white" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
          <ArrowRightEndOnRectangleIcon style={{ width: "1.1rem", height: "1.1rem" }} />
          Sign In
        </Link>
      </div>
    </nav>
  );
}

