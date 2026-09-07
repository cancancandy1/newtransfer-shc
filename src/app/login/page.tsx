"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      } else {
        // Next.js prepend basePath ให้อัตโนมัติ → /new-transfer/admin
        router.push("/admin");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="navbar">
        <Link href="/" className="navbar-brand">
          SHC Transfer
          <span style={{ fontSize: "1rem",fontWeight: "normal" }}>ระบบชำระค่าสมาชิก</span>
        </Link>
      </nav>
      <div className="login-wrapper">
        <div className="login-card" >
          <div className="login-logo">
            <div style={{ marginBottom: "0.25rem", display: "flex", justifyContent: "center" }}>
              <img
                src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/SHC_Logo.svg`}
                alt="SHC Logo"
                style={{ height: "90px", width: "auto", objectFit: "contain" }}
              />
            </div>
            <h1>Admin Sign-in</h1>
            <p>เข้าสู่ระบบเพื่อจัดการข้อมูล (สำหรับผู้ดูแล)</p>
          </div>

          {error && (
            <div className="alert alert-error">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">
                ชื่อผู้ใช้
              </label>
              <input
                id="username"
                type="text"
                className="form-control"
                placeholder="กรอก Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                รหัสผ่าน
              </label>
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="กรอก Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: "100%", marginTop: "0.5rem", textAlign: "center" }}
            >
              {loading ? (
                <><div className="spinner" /> กำลังเข้าสู่ระบบ...</>
              ) : (
                "เข้าสู่ระบบ"
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
