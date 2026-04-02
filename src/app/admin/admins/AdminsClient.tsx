"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/AdminNavbar";
import {
  createAdmin,
  updateAdmin,
  deleteAdmin,
  resetAdminPassword,
} from "@/app/actions/admin";
import { AdminRole } from "@prisma/client";

// ประเภทข้อมูล admin
interface AdminItem {
  id: number;
  firstname: string;
  lastname: string;
  username: string;
  role: AdminRole;
  created_at: Date;
}

// ค่าเริ่มต้นสำหรับ form
const defaultForm = {
  firstname: "",
  lastname: "",
  username: "",
  password: "",
  role: AdminRole.STAFF as AdminRole,
};

export default function AdminsClient({ admins: initialAdmins }: { admins: AdminItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // state รายการ admin
  const [admins, setAdmins] = useState<AdminItem[]>(initialAdmins);

  // Sync state when props change (e.g. after router.refresh())
  useEffect(() => {
    setAdmins(initialAdmins);
  }, [initialAdmins]);

  // state modal เพิ่ม/แก้ไข
  const [showFormModal, setShowFormModal] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminItem | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [formError, setFormError] = useState("");

  // state modal รีเซ็ตรหัสผ่าน
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetTarget, setResetTarget] = useState<AdminItem | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetError, setResetError] = useState("");

  // state modal ยืนยันการลบ
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminItem | null>(null);

  // เปิด modal สร้าง admin ใหม่
  const openCreate = () => {
    setEditTarget(null);
    setForm(defaultForm);
    setFormError("");
    setShowFormModal(true);
  };

  // เปิด modal แก้ไข admin
  const openEdit = (admin: AdminItem) => {
    setEditTarget(admin);
    setForm({
      firstname: admin.firstname,
      lastname: admin.lastname,
      username: admin.username,
      password: "",
      role: admin.role,
    });
    setFormError("");
    setShowFormModal(true);
  };

  // บันทึก admin (สร้าง / แก้ไข)
  const handleFormSubmit = async () => {
    setFormError("");

    // ตรวจสอบ input
    if (!form.firstname.trim() || !form.lastname.trim() || !form.username.trim()) {
      setFormError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    if (!editTarget && form.password.length < 6) {
      setFormError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    startTransition(async () => {
      try {
        if (editTarget) {
          // แก้ไขข้อมูล — อัปเดต local state ทันที
          await updateAdmin(editTarget.id, {
            firstname: form.firstname,
            lastname: form.lastname,
            username: form.username,
            role: form.role,
          });
          setAdmins((prev) =>
            prev.map((a) =>
              a.id === editTarget.id
                ? { ...a, firstname: form.firstname, lastname: form.lastname, username: form.username, role: form.role }
                : a
            )
          );
        } else {
          // สร้าง admin ใหม่ — refresh เพื่อดึง id ที่ได้รับ
          await createAdmin({
            firstname: form.firstname,
            lastname: form.lastname,
            username: form.username,
            password: form.password,
            role: form.role,
          });
          router.refresh();
        }
        setShowFormModal(false);
      } catch (err) {
        setFormError((err as Error).message);
      }
    });
  };

  // เปิด modal รีเซ็ตรหัสผ่าน
  const openReset = (admin: AdminItem) => {
    setResetTarget(admin);
    setNewPassword("");
    setConfirmPassword("");
    setResetError("");
    setShowResetModal(true);
  };

  // บันทึกรหัสผ่านใหม่
  const handleResetSubmit = async () => {
    setResetError("");

    if (newPassword.length < 6) {
      setResetError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    startTransition(async () => {
      try {
        await resetAdminPassword(resetTarget!.id, newPassword);
        setShowResetModal(false);
      } catch (err) {
        setResetError((err as Error).message);
      }
    });
  };

  // เปิด modal ยืนยันการลบ
  const openDelete = (admin: AdminItem) => {
    setDeleteTarget(admin);
    setShowDeleteModal(true);
  };

  // ลบ admin
  const handleDelete = async () => {
    startTransition(async () => {
      try {
        await deleteAdmin(deleteTarget!.id);
        setAdmins((prev) => prev.filter((a) => a.id !== deleteTarget!.id));
        setShowDeleteModal(false);
      } catch (err) {
        alert((err as Error).message);
        setShowDeleteModal(false);
      }
    });
  };

  // สีสำหรับ role badge
  const roleColor = (role: AdminRole) =>
    role === AdminRole.ADMIN
      ? { background: "#dbeafe", color: "#1d4ed8" }
      : { background: "#f0fdf4", color: "#166534" };

  return (
    <>
      <AdminNavbar />
      <div className="admin-container" style={{ maxWidth: "80%" }}>
        {/* หัวข้อหน้า */}
        <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1>จัดการผู้ดูแลระบบ</h1>
          <button className="btn btn-primary" onClick={openCreate}>
            + เพิ่มผู้ดูแล
          </button>
        </div>

        {/* ตารางรายชื่อ admin */}
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            {admins.length === 0 ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "var(--gray-500)" }}>
                ไม่พบข้อมูล
              </div>
            ) : (
              <table className="datatable">
                <thead>
                  <tr>
                    <th style={{ fontSize: "1rem" }}>ลำดับ</th>
                    <th style={{ fontSize: "1rem" }}>ชื่อ-นามสกุล</th>
                    <th style={{ fontSize: "1rem" }}>ชื่อผู้ใช้</th>
                    <th style={{ fontSize: "1rem" }}>บทบาท</th>
                    <th style={{ fontSize: "1rem", textAlign: "center" }}>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin, idx) => (
                    <tr key={admin.id}>
                      <td style={{ textAlign: "center" }}>{idx + 1}</td>
                      <td style={{ fontWeight: 500 }}>
                        {admin.firstname} {admin.lastname}
                      </td>
                      <td>
                        <code>{admin.username}</code>
                      </td>
                      <td>
                        <span
                          style={{
                            ...roleColor(admin.role),
                            padding: "0.2rem 0.65rem",
                            borderRadius: "999px",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                          }}
                        >
                          {admin.role === AdminRole.ADMIN ? "ผู้ดูแลหลัก" : "เจ้าหน้าที่"}
                        </span>
                      </td>
                      <td style={{ display: "flex", gap: "0.4rem" }}>
                        {/* ปุ่มแก้ไข */}
                        <button
                          className="btn btn-sm"
                          style={{ background: "#e2e8f0", color: "#1e293b", padding: "0.25rem 0.6rem" }}
                          onClick={() => openEdit(admin)}
                        >
                          ✏️ แก้ไข
                        </button>
                        {/* ปุ่มรีเซ็ตรหัสผ่าน */}
                        <button
                          className="btn btn-sm"
                          style={{ background: "#fef3c7", color: "#92400e", padding: "0.25rem 0.6rem" }}
                          onClick={() => openReset(admin)}
                        >
                          🔑 รีเซ็ตรหัสผ่าน
                        </button>
                        {/* ปุ่มลบ */}
                        <button
                          className="btn btn-sm"
                          style={{ background: "#fee2e2", color: "#b91c1c", padding: "0.25rem 0.6rem" }}
                          onClick={() => openDelete(admin)}
                        >
                          🗑️ ลบ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ─── Modal เพิ่ม/แก้ไข admin ─── */}
      {showFormModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ marginBottom: "1.25rem", fontWeight: 600 }}>
              {editTarget ? "แก้ไขข้อมูลผู้ดูแล" : "เพิ่มผู้ดูแลใหม่"}
            </h2>

            {/* ชื่อจริง */}
            <label style={labelStyle}>ชื่อจริง</label>
            <input
              style={inputStyle}
              value={form.firstname}
              onChange={(e) => setForm({ ...form, firstname: e.target.value })}
              placeholder="กรอกชื่อจริง"
            />

            {/* นามสกุล */}
            <label style={labelStyle}>นามสกุล</label>
            <input
              style={inputStyle}
              value={form.lastname}
              onChange={(e) => setForm({ ...form, lastname: e.target.value })}
              placeholder="กรอกนามสกุล"
            />

            {/* ชื่อผู้ใช้ */}
            <label style={labelStyle}>ชื่อผู้ใช้ (Username)</label>
            <input
              style={inputStyle}
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="กรอกชื่อผู้ใช้"
            />

            {/* รหัสผ่าน (เฉพาะสร้างใหม่) */}
            {!editTarget && (
              <>
                <label style={labelStyle}>รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)</label>
                <input
                  style={inputStyle}
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="กรอกรหัสผ่าน"
                />
              </>
            )}

            {/* บทบาท */}
            <label style={labelStyle}>บทบาท</label>
            <select
              style={inputStyle}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as AdminRole })}
            >
              <option value={AdminRole.ADMIN}>ผู้ดูแลหลัก (ADMIN)</option>
              <option value={AdminRole.STAFF}>เจ้าหน้าที่ (STAFF)</option>
            </select>

            {/* แสดงข้อผิดพลาด */}
            {formError && (
              <p style={{ color: "#b91c1c", fontSize: "0.875rem", marginTop: "0.5rem" }}>
                ⚠️ {formError}
              </p>
            )}

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem", justifyContent: "flex-end" }}>
              <button
                className="btn btn-outline"
                onClick={() => setShowFormModal(false)}
                disabled={isPending}
              >
                ยกเลิก
              </button>
              <button
                className="btn btn-primary"
                onClick={handleFormSubmit}
                disabled={isPending}
              >
                {isPending ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal รีเซ็ตรหัสผ่าน ─── */}
      {showResetModal && resetTarget && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ marginBottom: "0.5rem", fontWeight: 600 }}>รีเซ็ตรหัสผ่าน</h2>
            <p style={{ color: "var(--gray-500)", marginBottom: "1.25rem", fontSize: "0.9rem" }}>
              ผู้ดูแล: <strong>{resetTarget.firstname} {resetTarget.lastname}</strong> ({resetTarget.username})
            </p>

            {/* รหัสผ่านใหม่ */}
            <label style={labelStyle}>รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)</label>
            <input
              style={inputStyle}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="กรอกรหัสผ่านใหม่"
            />

            {/* ยืนยันรหัสผ่าน */}
            <label style={labelStyle}>ยืนยันรหัสผ่าน</label>
            <input
              style={inputStyle}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="กรอกรหัสผ่านอีกครั้ง"
            />

            {/* แสดงข้อผิดพลาด */}
            {resetError && (
              <p style={{ color: "#b91c1c", fontSize: "0.875rem", marginTop: "0.5rem" }}>
                ⚠️ {resetError}
              </p>
            )}

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem", justifyContent: "flex-end" }}>
              <button
                className="btn btn-outline"
                onClick={() => setShowResetModal(false)}
                disabled={isPending}
              >
                ยกเลิก
              </button>
              <button
                className="btn btn-primary"
                style={{ background: "#d97706", borderColor: "#d97706" }}
                onClick={handleResetSubmit}
                disabled={isPending}
              >
                {isPending ? "กำลังรีเซ็ต..." : "🔑 รีเซ็ตรหัสผ่าน"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal ยืนยันการลบ ─── */}
      {showDeleteModal && deleteTarget && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, maxWidth: "420px" }}>
            <h2 style={{ marginBottom: "0.75rem", fontWeight: 600, color: "#b91c1c" }}>
              ยืนยันการลบ
            </h2>
            <p style={{ color: "var(--gray-600)", marginBottom: "1.25rem" }}>
              คุณต้องการลบผู้ดูแล{" "}
              <strong>
                {deleteTarget.firstname} {deleteTarget.lastname}
              </strong>{" "}
              ({deleteTarget.username}) ใช่หรือไม่?
              <br />
              <span style={{ color: "#b91c1c", fontSize: "0.875rem" }}>การกระทำนี้ไม่สามารถย้อนกลับได้</span>
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button
                className="btn btn-outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={isPending}
              >
                ยกเลิก
              </button>
              <button
                className="btn btn-sm"
                style={{ background: "#b91c1c", color: "white", padding: "0.5rem 1rem", borderRadius: "6px" }}
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? "กำลังลบ..." : "🗑️ ยืนยันการลบ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Shared styles ───
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1rem",
};

const modalStyle: React.CSSProperties = {
  backgroundColor: "white",
  padding: "2rem",
  borderRadius: "10px",
  maxWidth: "500px",
  width: "100%",
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.875rem",
  fontWeight: 600,
  marginBottom: "0.35rem",
  marginTop: "0.85rem",
  color: "#374151",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.55rem 0.75rem",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "0.95rem",
  boxSizing: "border-box",
};
