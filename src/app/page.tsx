"use client";
import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";

interface MemberSubType {
  id: number;
  name: string;
  service_rate: number;
}

interface MemberType {
  id: number;
  name: string;
  description: string | null;
  sub_types: MemberSubType[];
}

export default function HomePage() {
  const [memberTypes, setMemberTypes] = useState<MemberType[]>([]);
  const [form, setForm] = useState({
    code: "",
    name: "",
    tel: "",
    email: "",
    memberType: "",
    member_type_id: "",
    member_sub_type_id: "",
    quantity: "1",
    consent: false,
  });
  const [selectedRate, setSelectedRate] = useState<number>(0);
  const [selectedTypeName, setSelectedTypeName] = useState<string>("");
  const [selectedSubTypeName, setSelectedSubTypeName] = useState<string>("");
  const [availableSubTypes, setAvailableSubTypes] = useState<MemberSubType[]>([]);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [isAutofilled, setIsAutofilled] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [fileError, setFileError] = useState<string>("");
  const [joinedMembers, setJoinedMembers] = useState<string[]>([]);

  const totalAmount = selectedRate * Number(form.quantity || 0);

  // Load member types
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/member-types`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(setMemberTypes)
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.warn("Could not load member types. Dev server might be down or compiling.", err.message);
      });
    
    return () => controller.abort();
  }, []);

  // Autofill on code
  const fetchUserData = useCallback(async (code: string) => {
    if (!code || code.length < 3) return;
    setIsFetching(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/user/${encodeURIComponent(code)}`);
      if (res.ok) {
        const data = await res.json();
        setForm((prev) => ({ ...prev, name: data.name ?? "", tel: data.tel ?? "", email: data.email ?? "", memberType: data.memberType?.name ?? "" }));
        setIsAutofilled(true);
      } else {
        setIsAutofilled(false);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      setIsAutofilled(false);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (form.code) fetchUserData(form.code);
    }, 600);
    return () => clearTimeout(t);
  }, [form.code, fetchUserData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    if (name === "member_type_id") {
      const mt = memberTypes.find((m) => String(m.id) === value);
      setSelectedTypeName(mt?.name ?? "");
      setAvailableSubTypes(mt?.sub_types ?? []);
      
      // Reset subtype when main type changes
      setForm((prev) => ({ ...prev, member_sub_type_id: "" }));
      setSelectedRate(0);
      setSelectedSubTypeName("");
    }

    if (name === "member_sub_type_id") {
      const st = availableSubTypes.find((s) => String(s.id) === value);
      setSelectedRate(st?.service_rate ?? 0);
      setSelectedSubTypeName(st?.name ?? "");
    }

    if (name === "code") {
      setIsAutofilled(false);
      setForm((prev) => ({ ...prev, name: "", tel: "", email: "", [name]: value, memberType: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError("");
    if (!file) { setSlipFile(null); return; }

    const allowed = ["image/jpeg", "image/png"];
    if (!allowed.includes(file.type)) {
      setFileError("รองรับเฉพาะไฟล์ .jpg และ .png เท่านั้น");
      setSlipFile(null);
      e.target.value = "";
      return;
    }
    setSlipFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!slipFile) {
      setAlert({ type: "error", message: "กรุณาแนบสลิปการโอนเงิน" });
      return;
    }
    if (!form.consent) {
      setAlert({ type: "error", message: "กรุณายินยอมการเก็บข้อมูลก่อนส่ง" });
      return;
    }
    

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("code", form.code);
      fd.append("name", form.name);
      fd.append("tel", form.tel);
      fd.append("email", form.email);
      fd.append("memberType", form.memberType);
      fd.append("member_type_id", form.member_type_id);
      fd.append("member_type_name", selectedTypeName);
      fd.append("member_sub_type_id", form.member_sub_type_id);
      fd.append("member_sub_type_name", selectedSubTypeName);
      fd.append("service_rate", String(selectedRate));
      fd.append("quantity", form.quantity);
      fd.append("total_amount", String(totalAmount));
      fd.append("joined_members", joinedMembers.slice(0, Number(form.quantity) - 1).filter(Boolean).join(","));
      fd.append("consent", String(form.consent));
      fd.append("slip", slipFile);

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/register`, { method: "POST", body: fd });
      const data = await res.json();
      const initialFormState = {
        code: "",
        name: "",
        tel: "",
        email: "",
        memberType: "",
        member_type_id: "",
        member_sub_type_id: "",
        quantity: "1",
        consent: false,
      };

      if (res.ok) {
        setAlert({ type: "success", message: `✅ ส่งข้อมูลสำเร็จ! หมายเลขรายการอ้างอิง: #${data.id}` });
        setForm(initialFormState);
        setSlipFile(null);
        setJoinedMembers([]);
        setSelectedRate(0);
        setSelectedTypeName("");
        setSelectedSubTypeName("");
        setAvailableSubTypes([]);
        setIsAutofilled(false);
      } else {
        setAlert({ type: "error", message: data.error || "เกิดข้อผิดพลาด" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="page-container">
        <div className="card">
          <h1 style={{ fontSize: "1.375rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            สมัครสมาชิก
          </h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem", marginBottom: "1.75rem" }}>
            กรอกข้อมูลให้ครบถ้วนและแนบสลิปการโอนเงิน
          </p>

          {alert && (
            <div className={`alert alert-${alert.type}`}>
              {alert.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Section 1: ข้อมูลผู้สมัคร */}
            <div className="section-title">ข้อมูลผู้สมัคร</div>

            {/* 1. รหัสผู้ใช้ */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="code">
                  รหัสนักศึกษา / รหัสพนักงาน / รหัสสมาชิก<span className="required">*</span>
                </label>
                <div style={{ position: "relative" }}>
                <input
                  id="code"
                  name="code"
                  type="text"
                  className="form-control"
                  placeholder="เช่น EMP001 หรือ A12345"
                  value={form.code}
                  onChange={handleChange}
                  required
                  style={{ textTransform: "uppercase", paddingRight: "2.5rem" }}
                />
                {isFetching && (
                  <div style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)" }}>
                    <div style={{ width: 16, height: 16, border: "2px solid #d1d5db", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  </div>
                )}
              </div>
              {isAutofilled && (
                <p style={{ fontSize: "0.75rem", color: "#059669", marginTop: "0.25rem" }}>
                  ✓ พบข้อมูลในระบบ
                </p>
              )}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="memberType">
                  ประเภทสมาชิก <span className="required">*</span>
                </label>
                <input
                  id="memberType"
                  name="memberType"
                  type="text"
                  className={`form-control ${isAutofilled ? "is-autofilled" : ""}`}
                  placeholder="ประเภทสมาชิก"
                  value={form.memberType}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-grid">
              {/* 2. ชื่อ-นามสกุล */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="name">
                  ชื่อ-นามสกุล <span className="required">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={`form-control ${isAutofilled ? "is-autofilled" : ""}`}
                  placeholder="ชื่อ นามสกุล"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* 3. เบอร์โทรศัพท์ */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="tel">
                  เบอร์โทรศัพท์ <span className="required">*</span>
                </label>
                <input
                  id="tel"
                  name="tel"
                  type="tel"
                  className={`form-control ${isAutofilled ? "is-autofilled" : ""}`}
                  placeholder="0XX-XXX-XXXX"
                  value={form.tel}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-grid" style={{ marginTop: "1rem" }}>
              {/* 3.5 อีเมล */}
              <div className="form-group" style={{ margin: 0, gridColumn: "span 2" }}>
                <label className="form-label" htmlFor="email">
                  อีเมล (ไม่บังคับ)
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`form-control ${isAutofilled && form.email ? "is-autofilled" : ""}`}
                  placeholder="example@sut.ac.th"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Section 2: ข้อมูลการสมัคร */}
            <div className="section-title" style={{ marginTop: "1.5rem" }}>ข้อมูลการสมัคร</div>

            <div className="form-grid">
              {/* 4. ประเภทสมาชิก */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="member_type_id">
                  ประเภทสมาชิก <span className="required">*</span>
                </label>
                <select
                  id="member_type_id"
                  name="member_type_id"
                  className="form-control"
                  value={form.member_type_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- เลือกประเภทสมาชิก --</option>
                  {memberTypes.map((mt) => (
                    <option key={mt.id} value={String(mt.id)}>
                      {mt.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4.5. ประเภทสมาชิกย่อย */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="member_sub_type_id">
                  รูปแบบ / ระยะเวลา <span className="required">*</span>
                </label>
                <select
                  id="member_sub_type_id"
                  name="member_sub_type_id"
                  className="form-control"
                  value={form.member_sub_type_id}
                  onChange={handleChange}
                  required
                  disabled={availableSubTypes.length === 0}
                >
                  <option value="">-- เลือกรูปแบบ --</option>
                  {availableSubTypes.map((st) => (
                    <option key={st.id} value={String(st.id)}>
                      {st.name} (฿{st.service_rate.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. อัตราค่าบริการ */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">
                  อัตราค่าบริการ (บาท/คน)
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={selectedRate > 0 ? `฿${selectedRate.toLocaleString()}` : "— เลือกประเภทสมาชิกก่อน"}
                  readOnly
                />
              </div>
            </div>

            <div className="form-grid" style={{ marginTop: "1.25rem" }}>
              {/* 6. จำนวนคน */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="quantity">
                  จำนวนคนที่สมัคร <span className="required">*</span>
                </label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  className="form-control"
                  min="1"
                  max="3"  /*กำหนดให้เพิ่มได้ไม่เกิน 3 คน*/
                  value={form.quantity}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* 7. รวมเงิน */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">รวมเงิน</label>
                <div className="amount-display">
                  <div className="label">ยอดชำระทั้งหมด</div>
                  <div className="amount">
                    ฿{totalAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>

            {/* รหัสสมาชิกที่ร่วมจ่าย (ถ้ามีมากกว่า 1 คน) */}
            {Number(form.quantity) > 1 && (
              <div className="section-title" style={{ marginTop: "1.5rem" }}>รหัสสมาชิกที่ร่วมจ่าย</div>
            )}
            {Number(form.quantity) > 1 && (
              <div className="form-grid">
                {Array.from({ length: Math.min(Number(form.quantity) - 1, 2) }).map((_, i) => (
                  <div className="form-group" style={{ margin: 0 }} key={i}>
                    <label className="form-label">
                      รหัสนักศึกษา / รหัสพนักงาน / รหัสสมาชิก คนที่ {i + 2} <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={`รหัสพนักงานคนที่ ${i + 2}`}
                      value={joinedMembers[i] || ""}
                      onChange={(e) => {
                        const newMembers = [...joinedMembers];
                        newMembers[i] = e.target.value;
                        setJoinedMembers(newMembers);
                      }}
                      style={{ textTransform: "uppercase" }}
                      required
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Section 3: เอกสารแนบ */}
            <div className="section-title" style={{ marginTop: "1.5rem" }}>เอกสารแนบ</div>

            {/* 8. อัปโหลดสลิป */}
            <div className="form-group">
              <label className="form-label">
                สลิปการโอนเงิน <span className="required">*</span>
                <span style={{ fontSize: "0.75rem", fontWeight: 400, color: "var(--gray-500)", marginLeft: "0.5rem" }}>
                  (รองรับ .jpg, .png)
                </span>
              </label>
              <div className={`upload-zone ${slipFile ? "has-file" : ""}`}>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleFileChange}
                  title="เลือกไฟล์สลิป"
                />
                {!slipFile ? (
                  <>
                    <div className="upload-icon">📎</div>
                    <div className="upload-text">
                      <strong>คลิกเพื่อเลือกไฟล์</strong> หรือลากวางที่นี่
                    </div>
                    <div className="upload-text" style={{ marginTop: "0.25rem" }}>
                      ไฟล์ .jpg หรือ .png เท่านั้น
                    </div>
                  </>
                ) : (
                  <div className="upload-preview">
                    <span style={{ fontSize: "1.5rem" }}>🖼️</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{slipFile.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}>
                        {(slipFile.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {fileError && (
                <p style={{ fontSize: "0.75rem", color: "var(--danger)", marginTop: "0.35rem" }}>
                  ⚠️ {fileError}
                </p>
              )}
            </div>

            {/* 10. ยินยอมการเก็บข้อมูล */}
            <div className="consent-box" style={{ marginBottom: "1.5rem" }}>
              <input
                type="checkbox"
                id="consent"
                name="consent"
                checked={form.consent}
                onChange={handleChange}
              />
              <label htmlFor="consent">
                ข้าพเจ้ายินยอมให้ทางระบบ SHC Transfer เก็บรวบรวม ใช้ และ/หรือเปิดเผยข้อมูลส่วนบุคคลของข้าพเจ้า
                เพื่อวัตถุประสงค์ในการดำเนินการสมัครสมาชิก ตามนโยบายความเป็นส่วนตัว
                <span style={{ color: "var(--danger)" }}> *</span>
              </label>
            </div>

            {/* 9. ปุ่มส่ง */}
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isSubmitting}
              style={{ width: "100%" }}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" /> กำลังส่งข้อมูล...
                </>
              ) : (
                "📨 ส่งใบสมัคร"
              )}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
