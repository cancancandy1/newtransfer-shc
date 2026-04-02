"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import AdminNavbar from "@/components/AdminNavbar";

interface Registration {
  id: number;
  code: string;
  name: string;
  tel: string;
  email?: string;
  memberType: string | null;
  joined_members: string | null;
  member_type_name: string;
  member_sub_type_name: string;
  service_rate: number;
  quantity: number;
  total_amount: number;
  slip_path: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submitted_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "รอตรวจสอบยอดชำระ",
  APPROVED: "ยืนยันการชำระเงิน",
  REJECTED: "ปฏิเสธการชำระเงิน",
};

export default function AdminPage() {
  const { data: session } = useSession();
  const [rows, setRows] = useState<Registration[]>([]);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState(""); // For the input field
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/admin/registrations?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`)
      .then((r) => r.json())
      .then((d) => {
        setRows(d.data || []);
        setTotal(d.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, search]);

  // Handle Search Input (debounce manual simple)
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    // find old status
    const oldRowIndex = rows.findIndex((r) => r.id === id);
    if (oldRowIndex === -1) return;
    const oldStatus = rows[oldRowIndex].status;

    // optimistic update
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus as Registration["status"] } : r))
    );

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/admin/registrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Update failed");
    } catch (e) {
      alert("ไม่สามารถเปลี่ยนสถานะได้: " + (e as Error).message);
      // rollback
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: oldStatus } : r))
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("คุณต้องการลบรายการนี้ใช่หรือไม่?")) return;

    // optimistic delete
    const oldRows = [...rows];
    setRows((prev) => prev.filter((r) => r.id !== id));

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/admin/registrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDeleted: true }),
      });
      if (!res.ok) throw new Error("Delete failed");
    } catch (e) {
      alert("ไม่สามารถลบข้อมูลได้ : " + (e as Error).message);
      setRows(oldRows);
    }
  };

  // filtering is now handled by the server, so we just use rows
  const filtered = rows;
  const totalPages = Math.ceil(total / limit);

  const handlePrint = (id: number) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    const win = window.open("", "_blank");
    if (!win) return;
    const imageUrl = `${window.location.origin}${row.slip_path}`;
    win.document.write(`
      <html><head><title>ใบสมัคร #${id}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap');
        body { 
          font-family: 'Sarabun', sans-serif; 
          padding: 1rem; 
          margin: 0;
        }
        .content-wrapper {
          max-width: 750px;
          margin: 0 auto;
        }
        @media print { 
          @page { size: portrait; }
          body { 
            font-family: 'Sarabun', sans-serif; 
          } 
          .content-wrapper {
            max-width: 100%;
          }
        }
        table { width: 60%; border-collapse: collapse; margin: 1rem auto; }
        td { padding: .3rem; border: 1px solid #e0e0e0ff; text-align: left; }
        th { width: 30%; padding: .3rem; border: 1px solid #e0e0e0ff; text-align: left; background: #fcfcfc; }
      </style>
      </head><body>
      <div class="content-wrapper" style="padding: 0rem; margin: 0rem;">
        <!-- โลโก้ SUT และ SHC -->
        <div style="text-align: center; margin: 0px; padding: 0px;">
          <img src="/SUT_logo_svg.svg" style="height: 70px;" />
          <img src="/sSHC_logo_png.png" style="height: 70px;" />
        </div>
        <h2 style="text-align: center; font-size: 22px; padding-bottom: 0rem; margin-bottom: 0rem;">เอกสารการจ่ายเงินค่าสมัครสมาชิก</h2>
        <p style="text-align: center; font-size: 17px; padding: 0rem; margin: 0.5rem;">สถานกีฬาและสุขภาพ มหาวิทยาลัยเทคโนโลยีสุรนารี</p>
        
        <table>
          <tr>
            <th style="font-weight: 600; font-size: 15px;">รหัสผู้ใช้</th>
            <td style="font-size: 15px;">${row.code}</td>
          </tr>
          <tr>
            <th style="font-weight: 600; font-size: 15px;">ชื่อ-นามสกุล</th>
            <td style="font-size: 15px;">${row.name}</td>
          </tr>
          ${row.joined_members ? `
          <tr>
            <th style="font-weight: 600; font-size: 15px;">สมาชิกที่ร่วมจ่าย</th>
            <td style="font-size: 15px;">${row.joined_members.split(',').join(', ')}</td>
          </tr>
          ` : ""}
          <tr>
            <th style="font-weight: 600; font-size: 15px;">ประเภท</th>
            <td style="font-size: 15px;">${row.memberType || "-"}</td>
          </tr>
          <tr>
            <th style="font-weight: 600; font-size: 15px;">เบอร์โทรศัพท์</th>
            <td style="font-size: 15px;">${row.tel}</td>
          </tr>
          <tr>
            <th style="font-weight: 600; font-size: 15px;">ประเภทสมาชิก</th>
            <td style="font-size: 15px;">${row.member_type_name}</td>
          </tr>
          <tr>
            <th style="font-weight: 600; font-size: 15px;">รูปแบบ</th>
            <td style="font-size: 15px;">${row.member_sub_type_name}</td>
          </tr>
          <tr>
            <th style="font-weight: 600; font-size: 15px;">จำนวน / อัตราค่าบริการ</th>
            <td style="font-size: 15px;">${row.quantity} ท่าน (ท่านละ ${row.service_rate.toLocaleString()} บาท)</td>
          </tr>
          <tr>
            <th style="font-weight: 600; font-size: 15px;">รวมเป็นเงิน</th>
            <td style="font-size: 15px;">${row.total_amount.toLocaleString()} บาท</td>
          </tr>
          <!-- <tr>
            <th style="font-weight: 600; font-size: 15px;">สถานะ</th>
            <td style="font-size: 15px;">${STATUS_LABELS[row.status]}</td>
          </tr> -->
          <tr>
            <th style="font-weight: 600; font-size: 15px;">วันที่สมัคร</th>
            <td style="font-size: 15px;">${new Date(row.submitted_at).toLocaleString("th-TH")}</td>
          </tr>
        </table>
        
        <br/>
        <div style="display: flex; justify-content: center; padding: 0rem; margin: 0rem;">
          <img id="slipImage" src="${imageUrl}" style="max-width:320px;border:1px solid #ccc;border-radius:8px;"/>
        </div>
        
        <div style="
          position: fixed;
          bottom: 20px;
          left: 0;
          width: 100%;
          display: flex;
          justify-content: space-between;
          padding: 0 0px;
          ">
          <div style="text-align: center; font-size: 15px;">
            <div>ลงชื่อ_______________________________ผู้สมัคร</div>
            <div style="margin-top: 10px;">${row.name}</div>
          </div>

          <div style="text-align: center; font-size: 15px;">
            <div>ลงชื่อ_______________________________ผู้รับสมัคร</div>
            <div style="margin-top: 10px;">
              ${session?.user?.firstname ?? ''} ${session?.user?.lastname ?? ''}
            </div>
          </div>
        </div>
      </div>

      <script>
          const img = document.getElementById("slipImage");
          img.onload = function() {
            window.print();
            window.close();
          };
        <\/script>
      </body></html>
    `);
    console.log(imageUrl); //เช็คว่าเจอจริงมั้ย
    console.log("WINDOW TEST:", win); //เช็คว่าเจอจริงมั้ย
    win.document.close();
  };

  return (
    <>
      <AdminNavbar />
      <div className="admin-container" style={{ maxWidth: "80%" }}>
        <div className="page-header">
          <h1>รายการสมัครสมาชิกทั้งหมด</h1>
          <div className="search-bar">
            <span>🔍</span>
            <input
              placeholder="ค้นหา รหัส / ชื่อ / เบอร์..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>

        {/* Summary cards - showing current page view or total */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
          {[
            { label: "ทั้งหมด", value: rows.length, color: "#1a56db" },
            { label: "รอดำเนินการ", value: rows.filter(r => r.status === "PENDING").length, color: "#d97706" },
            { label: "อนุมัติแล้ว", value: rows.filter(r => r.status === "APPROVED").length, color: "#059669" },
            // { label: "รายการทั้งหมด", value: total, color: "#1a56db" },
            // { label: "หน้าปัจจุบัน", value: `${page} / ${totalPages || 1}`, color: "#059669" },
            // { label: `ตัวกรอง: ${searchInput}`, value: searchInput ? "เริ่มค้นหา..." : "ไม่มี", color: "#d97706" },
          ].map((s) => (
            <div key={s.label} className="card" style={{ padding: "1.25rem", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: 700, color: s.color }}>{s.value}</div>
              {/* <div style={{ fontSize: "1.5rem", fontWeight: 700, color: s.color, minHeight: "2.25rem" }}>
                  {s.value}
              </div> */}
              <div style={{ fontSize: "0.975rem", color: "var(--gray-500)", marginTop: "0.25rem" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            {loading ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "var(--gray-500)" }}>
                กำลังโหลดข้อมูล...
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "var(--gray-500)" }}>
                ไม่พบข้อมูล
              </div>
            ) : (
              <table className="datatable">
                <thead>
                  <tr>
                    <th style={{ fontSize: "1rem" }}>ลำดับ</th>
                    <th style={{ fontSize: "1rem" }}>รหัสผู้ใช้</th>
                    <th style={{ fontSize: "1rem" }}>ชื่อ-นามสกุล</th>
                    <th style={{ fontSize: "1rem" }}>เบอร์โทร</th>
                    <th style={{ fontSize: "1rem" }}>ประเภทสมาชิก</th>
                    <th style={{ fontSize: "1rem", textAlign: "center" }}>จำนวน</th>
                    <th style={{ fontSize: "1rem", textAlign: "center" }}>รวมเงิน</th>
                    <th style={{ fontSize: "1rem", textAlign: "center" }}>สถานะ</th>
                    <th style={{ fontSize: "1rem", textAlign: "center" }}>วันที่</th>
                    <th style={{ textAlign: "center", fontSize: "1rem"}}>จัดการ</th>
                  </tr>
                </thead>
                <tbody style={{ background: "var(--gray-100)", padding: "2px 6px", borderRadius: 4, fontSize: "0.950rem" }}>
                  {filtered.map((r, index) => (
                    <tr key={r.id}>
                      <td style={{ textAlign: "center" }}>{(page - 1) * limit + index + 1}</td>
                      <td><code>{r.code}</code></td>
                      <td style={{ fontWeight: 500 }}>
                        {r.name}
                        {r.memberType && <div style={{ fontSize: "0.85rem", color: "var(--gray-500)", marginTop: "2px" }}>{r.memberType}</div>}
                        {r.joined_members && <div style={{ fontSize: "0.85rem", color: "var(--primary)", marginTop: "2px" }}>+ ผู้ร่วม: {r.joined_members.split(',').join(', ')}</div>}
                      </td>
                      <td>{r.tel}</td>
                      <td>
                        {r.member_type_name}
                        <br/>
                        <span style={{ fontSize: "0.9rem", color: "var(--gray-500)" }}>{r.member_sub_type_name}</span>
                      </td>
                      <td style={{ textAlign: "center"}}>{r.quantity}</td>
                      <td style={{ fontWeight: 600, color: "var(--primary)", textAlign: "center" }}>฿{r.total_amount.toLocaleString()}</td>
                      <td style={{ textAlign: "center" }}>
                        <select
                          value={r.status}
                          onChange={(e) => handleStatusChange(r.id, e.target.value)}
                          className={`badge badge-${r.status.toLowerCase()}`}
                          style={{ border: "none", cursor: "pointer", outline: "none" }}
                        >
                          <option value="PENDING" style={{ backgroundColor: "white", color: "black" }}>รอดำเนินการ</option>
                          <option value="APPROVED" style={{ backgroundColor: "white", color: "black" }}>ยืนยันการชำระเงิน</option>
                          <option value="REJECTED" style={{ backgroundColor: "white", color: "black" }}>ปฏิเสธ</option>
                        </select>
                      </td>
                      <td style={{ fontSize: "0.9rem", color: "var(--gray-500)" }}>
                        {new Date(r.submitted_at).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "2-digit" })}
                      </td>
                      <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center", // แนวนอน
                            alignItems: "center",     // แนวตั้ง
                            gap: "0.25rem",
                          }}
                        >
                          <button
                            onClick={() => setSelectedRegistration(r)}
                            className="btn btn-md btn-info"
                            style={{ padding: "0.25rem 0.5rem" }}
                            title="ดูรายละเอียด"
                          >
                            รายละเอียด
                          </button>

                          <button
                            onClick={() => handlePrint(r.id)}
                            className="btn btn-md btn-primary"
                            style={{ padding: "0.25rem 0.5rem" }}
                            title="พิมพ์ใบสมัคร"
                          >
                            🖨️ พิมพ์
                          </button>

                          <button
                            onClick={() => handleDelete(r.id)}
                            className="btn btn-md btn-danger"
                            style={{ padding: "0.25rem 0.5rem" }}
                            title="ลบข้อมูล"
                          >
                            ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.5rem", borderTop: "1px solid var(--gray-100)" }}>
            <div style={{ fontSize: "0.875rem", color: "var(--gray-500)" }}>
              แสดงหน้า {page} จาก {totalPages || 1} (รวม {total} รายการ)
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn btn-outline"
                style={{ cursor: page === 1 ? "not-allowed" : "pointer" }}
              >
                ก่อนหน้า
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="btn btn-outline"
                style={{ cursor: page >= totalPages ? "not-allowed" : "pointer" }}
              >
                ถัดไป
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for viewing details */}
      {selectedRegistration && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "8px", maxWidth: "700px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button 
                onClick={() => setSelectedRegistration(null)} 
                className="btn" 
                style={{ backgroundColor: "#e2e8f0", color: "#1e293b", padding: "0.5rem 1rem", border: "none", cursor: "pointer", borderRadius: "4px" }}
              >
                ปิดหน้าต่าง
              </button>
            </div>
            <h2 style={{ marginBottom: "1rem", fontWeight: 600 }}>รายละเอียดการสมัคร #{selectedRegistration.id}</h2>
            <table style={{ width: "100%", marginBottom: "1rem", borderCollapse: "collapse" }}>
              <tbody>
                <tr style={{ borderBottom: "1px solid #eee" }}><td style={{ padding: "0.5rem", fontWeight: 600 }}>รหัสผู้ใช้:</td><td style={{ padding: "0.5rem" }}>{selectedRegistration.code}</td></tr>
                <tr style={{ borderBottom: "1px solid #eee" }}><td style={{ padding: "0.5rem", fontWeight: 600 }}>ชื่อ-นามสกุล:</td><td style={{ padding: "0.5rem" }}>{selectedRegistration.name}</td></tr>
                {selectedRegistration.joined_members && (
                  <tr style={{ borderBottom: "1px solid #eee" }}><td style={{ padding: "0.5rem", fontWeight: 600 }}>ผู้ร่วมจ่าย:</td><td style={{ padding: "0.5rem", color: "var(--primary)", fontWeight: 500 }}>{selectedRegistration.joined_members.split(',').join(', ')}</td></tr>
                )}
                <tr style={{ borderBottom: "1px solid #eee" }}><td style={{ padding: "0.5rem", fontWeight: 600 }}>ประเภท:</td><td style={{ padding: "0.5rem" }}>{selectedRegistration.memberType || "-"}</td></tr>
                <tr style={{ borderBottom: "1px solid #eee" }}><td style={{ padding: "0.5rem", fontWeight: 600 }}>เบอร์โทร:</td><td style={{ padding: "0.5rem" }}>{selectedRegistration.tel}</td></tr>
                <tr style={{ borderBottom: "1px solid #eee" }}><td style={{ padding: "0.5rem", fontWeight: 600 }}>ประเภทคลาส:</td><td style={{ padding: "0.5rem" }}>{selectedRegistration.member_type_name} ({selectedRegistration.member_sub_type_name})</td></tr>
                <tr style={{ borderBottom: "1px solid #eee" }}><td style={{ padding: "0.5rem", fontWeight: 600 }}>จำนวน:</td><td style={{ padding: "0.5rem" }}>{selectedRegistration.quantity}</td></tr>
                <tr style={{ borderBottom: "1px solid #eee" }}><td style={{ padding: "0.5rem", fontWeight: 600 }}>รวมเงิน:</td><td style={{ padding: "0.5rem", color: "var(--primary)", fontWeight: "bold" }}>฿{selectedRegistration.total_amount.toLocaleString()}</td></tr>
                <tr style={{ borderBottom: "1px solid #eee" }}><td style={{ padding: "0.5rem", fontWeight: 600 }}>สถานะ:</td><td style={{ padding: "0.5rem" }}>{STATUS_LABELS[selectedRegistration.status]}</td></tr>
              </tbody>
            </table>
            <div style={{ marginBottom: "1.5rem" }}>
              <strong>สลิปโอนเงิน:</strong><br />
              <img src={selectedRegistration.slip_path} alt="Slip" style={{ maxWidth: "100%", marginTop: "0.5rem", borderRadius: "8px", border: "1px solid #ccc", maxHeight: "400px", objectFit: "contain" }} />
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}
