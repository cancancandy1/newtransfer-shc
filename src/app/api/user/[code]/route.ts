
// api ดึงข้อมูลมาจากฐานข้อมูลหลัก sutsport.sut.ac.th

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const { code } = params;

  if (!code) {
    return NextResponse.json({ error: "กรุณาระบุรหัส" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { code: code.toUpperCase() },
    select: { name: true, tel: true, email: true, memberType: true },
  });

  if (user) {
    return NextResponse.json({
      name: user.name,
      code: code.toUpperCase(),
      tel: user.tel,
      email: user.email || "",
      memberType: { name: user.memberType || "" }
    });
  }

  // Not found in DB, fetch from external API
  try {
    const urlService = process.env.SUTSPORT_API_URL || "https://sutsport.sut.ac.th/service/member/code/";
    const token = process.env.SUTSPORT_API_TOKEN || "";
    
    if (!token) {
      console.warn("External API Token not configured.");
      return NextResponse.json({ error: "ไม่พบข้อมูล และยังไม่ได้ตั้งค่า API Token" }, { status: 404 });
    }

    const res = await fetch(`${urlService}${encodeURIComponent(code)}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (data.instances && data.instances.length > 0) {
        const instance = data.instances[0];
        return NextResponse.json({
          name: instance.name,
          code: instance.code,
          tel: instance.tel,
          email: instance.email,
          memberType: {
            name: instance.memberType?.name || ""
          }
        });
      }
    }
  } catch (error) {
    console.error("External API Error:", error);
  }

  return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้" }, { status: 404 });
}
