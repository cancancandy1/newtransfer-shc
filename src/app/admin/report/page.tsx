"use client";
import { useState, useEffect } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { sarabunFont } from "@/lib/font/sarabun-font";
import {
  DocumentChartBarIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";

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
  status: "PENDING" | "APPROVED" | "REJECTED";
  submitted_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "รอดำเนินการ",
  APPROVED: "ผ่านการตรวจสอบ",
  REJECTED: "ไม่ผ่านการตรวจสอบ",
};

export default function AdminReportPage() {
  const [rows, setRows] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  
  // Date filter state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination state
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/admin/registrations?page=${page}&limit=${limit}`;
      if (startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await fetch(url);
      const d = await res.json();
      setRows(d.data || []);
      setTotal(d.total || 0);
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถดึงข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, page]);

  const fetchAllData = async () => {
    let url = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/admin/registrations?all=true`;
    if (startDate && endDate) {
      url += `&startDate=${startDate}&endDate=${endDate}`;
    }
    const res = await fetch(url);
    const d = await res.json();
    return d.data || [];
  };

  const exportExcel = async () => {
    setExportLoading(true);
    try {
      const allRows = await fetchAllData();
      const ws = XLSX.utils.json_to_sheet(allRows.map((r: Registration) => ({
        "ลำดับ": r.id,
        "รหัสผู้ใช้": r.code,
        "ชื่อ-นามสกุล": r.name,
        "ผู้ร่วมจ่าย": r.joined_members?.split(',').join(', ') || "-",
        "เบอร์โทร": r.tel,
        "ประเภท": r.memberType || "-",
        "ประเภทสมาชิก": r.member_type_name,
        "รูปแบบ": r.member_sub_type_name,
        "จำนวน": r.quantity,
        "ยอดรวม": r.total_amount,
        "สถานะ": STATUS_LABELS[r.status],
        "วันที่สมัคร": `${new Date(r.submitted_at).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "2-digit" })}`
      })));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Report");
      XLSX.writeFile(wb, "registration_report.xlsx");
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการโหลดข้อมูล Export");
    } finally {
      setExportLoading(false);
    }
  };

  const exportPDF = async () => {
    setExportLoading(true);
    try {
      const allRows = await fetchAllData();
      const doc = new jsPDF({ orientation: "landscape" });

      // add font for thai support
      doc.addFileToVFS("Sarabun-Medium-normal.ttf", sarabunFont);
      doc.addFont("Sarabun-Medium-normal.ttf", "Sarabun-Medium", "normal");
      doc.setFont("Sarabun-Medium");
      
      doc.text("รายงานสรุปการสมัครสมาชิก", 14, 15);
      
      const tableColumn = ["No.", "ID", "Name", "Joined", "Phone", "Type of User", "Type of Membership", "Amount", "Status", "Date"];
      const tableRows: (string | number)[][] = [];

      allRows.forEach((r: Registration, index: number) => {
        const rowData = [
          index + 1,
          r.code,
          r.name,
          r.joined_members?.split(',').join(', ') || "-",
          r.tel,
          r.memberType || "-",
          `${r.member_type_name} (${r.member_sub_type_name})`,
          r.total_amount,
          STATUS_LABELS[r.status] || r.status,
          new Date(r.submitted_at).toLocaleDateString("th-TH")
        ];
        tableRows.push(rowData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        styles: {
          font: "Sarabun-Medium",
        }
      });

      doc.save("registration_report.pdf");
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการโหลดข้อมูล Export");
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="admin-container" style={{ maxWidth: "80%" }}>
        <div className="page-header" style={{ flexWrap: "wrap", gap: "1rem" }}>
          <h1>รายงานสรุปการสมัครสมาชิก</h1>
          
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <label>ตั้งแต่วันที่:</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="btn" 
                style={{ backgroundColor: "white", padding: "0.5rem", border: "1px solid #ccc" }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <label>ถึงวันที่:</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                className="btn" 
                style={{ backgroundColor: "white", padding: "0.5rem", border: "1px solid #ccc" }}
              />
            </div>
            {startDate && endDate && (
              <button 
                onClick={() => { setStartDate(""); setEndDate(""); }}
                className="btn btn-outline"
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", alignItems: "center" }}>
          <button onClick={exportExcel} disabled={exportLoading} className="btn btn-primary" style={{ backgroundColor: "#16a34a", opacity: exportLoading ? 0.7 : 1 }}>
            <DocumentChartBarIcon style={{width: "1.3rem", height: "1.3rem"}}/> 
            Export Excel
          </button>
          <button onClick={exportPDF} disabled={exportLoading} className="btn btn-primary" style={{ backgroundColor: "#dc2626", opacity: exportLoading ? 0.7 : 1 }}>
            <DocumentTextIcon style={{width: "1.3rem", height: "1.3rem"}}/>
            Export PDF
          </button>
          {exportLoading && <span style={{ color: "var(--gray-500)", fontSize: "0.9rem" }}>กำลังดึงข้อมูลทั้งหมดเพื่อสร้างไฟล์...</span>}
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            {loading ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "var(--gray-500)" }}>
                กำลังโหลดข้อมูล...
              </div>
            ) : rows.length === 0 ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "var(--gray-500)" }}>
                ไม่พบข้อมูลในช่วงเวลาที่เลือก
              </div>
            ) : (
              <table className="datatable">
                <thead>
                  <tr>
                    <th style={{ textAlign: "center",fontSize: "0.9rem" }}>ลำดับ</th>
                    <th style={{ fontSize: "0.9rem" }}>รหัสผู้ใช้</th>
                    <th style={{ fontSize: "0.9rem" }}>ชื่อ-นามสกุล</th>
                    <th style={{ fontSize: "0.9rem" }}>เบอร์โทร</th>
                    <th style={{ fontSize: "0.9rem" }}>ประเภท</th>
                    <th style={{ fontSize: "0.9rem", textAlign: "center" }}>จำนวน</th>
                    <th style={{ fontSize: "0.9rem", textAlign: "center" }}>ยอดรวม</th>
                    <th style={{ fontSize: "0.9rem", textAlign: "center" }}>สถานะ</th>
                    <th style={{ fontSize: "0.9rem", textAlign: "center" }}>วันที่สมัคร</th>
                  </tr>
                </thead>
                <tbody style={{ background: "var(--gray-100)", padding: "2px 6px", borderRadius: 4, fontSize: "1rem" }}>
                  {rows.map((r, index) => (
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
                        <span style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>{r.member_sub_type_name}</span>
                      </td>
                      <td style={{ textAlign: "center" }}>{r.quantity} คน</td>
                      <td style={{ fontWeight: 600, color: "var(--primary)", textAlign: "center" }}>฿{r.total_amount.toLocaleString()}</td>
                      <td style={{ textAlign: "center" }}>
                        <span className={`badge badge-${r.status.toLowerCase()}`}>
                          {STATUS_LABELS[r.status]}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.9rem", color: "var(--gray-500)", textAlign: "center" }}>
                        {new Date(r.submitted_at).toLocaleDateString("th-TH",{ day: "2-digit", month: "short", year: "2-digit" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.5rem", borderTop: "1px solid var(--gray-100)" }}>
            <div style={{ fontSize: "0.875rem", color: "var(--gray-500)" }}>
              แสดงหน้า {page} จาก {Math.ceil(total / limit) || 1} (รวม {total} รายการ)
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
                disabled={page >= Math.ceil(total / limit)}
                onClick={() => setPage((p) => Math.min(Math.ceil(total / limit), p + 1))}
                className="btn btn-outline"
                style={{ cursor: page >= Math.ceil(total / limit) ? "not-allowed" : "pointer" }}
              >
                ถัดไป
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
