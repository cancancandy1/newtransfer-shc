import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import sharp from "sharp";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const code = formData.get("code") as string;
    const name = formData.get("name") as string;
    const tel = formData.get("tel") as string;
    const email = formData.get("email") as string;
    const memberType = formData.get("memberType") as string;
    const member_type_id = Number(formData.get("member_type_id"));
    const member_type_name = formData.get("member_type_name") as string;
    const member_sub_type_id = Number(formData.get("member_sub_type_id"));
    const member_sub_type_name = formData.get("member_sub_type_name") as string;
    const service_rate = Number(formData.get("service_rate"));
    const quantity = Number(formData.get("quantity"));
    const total_amount = Number(formData.get("total_amount"));
    const joined_members = formData.get("joined_members") as string | null;
    const consent = formData.get("consent") === "true";
    const slip = formData.get("slip") as File;

    // Validate
    if (!code || !name || !tel || !member_type_id || !member_sub_type_id || !quantity || !slip || !consent) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(slip.type)) {
      return NextResponse.json({ error: "รองรับเฉพาะไฟล์ .jpg และ .png เท่านั้น" }, { status: 400 });
    }

    // Check size
    if (slip.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "ไฟล์ต้องไม่เกิน 5MB" },
        { status: 400 }
      );
    }

    // Save file
    const bytes = await slip.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Compress + Resize image
    const compressedBuffer = await sharp(buffer)
      .resize({ width: 768 }) // ลดขนาดภาพ
      .jpeg({ quality: 60 })   // บีบอัดไฟล์
      .toBuffer();

    // Create upload directory
    const uploadDir = path.join(process.cwd(), "public", "uploads", "slip");
    await mkdir(uploadDir, { recursive: true });

    // ตั้งชื่อไฟล์ (แปลงเป็น jpg เสมอ)
    // const ext = slip.name.split(".").pop();
    // const filename = `slip_${Date.now()}_${code}.${ext}`;
    const filename = `slip_${Date.now()}_${code}.jpg`;
    const filePath = path.join(uploadDir, filename);

    // Save compressed image
    await writeFile(filePath, compressedBuffer);

    // Upsert user (สร้างถ้าไม่มี, อัปเดตถ้ามีแล้ว) — แก้ FK constraint
    const user = await prisma.user.upsert({
      where: { code: code.toUpperCase() },
      update: { name, tel, email, memberType },
      create: { code: code.toUpperCase(), name, tel, email, memberType },
    });

    // Save to DB
    const registration = await prisma.registration.create({
      data: {
        user_id: user.id,
        code: code.toUpperCase(),
        name,
        tel,
        email,
        memberType,
        member_type_name,
        member_sub_type_id,
        member_sub_type_name,
        service_rate,
        quantity,
        total_amount,
        slip_filename: filename,
        slip_path: `/uploads/slip/${filename}`,
        joined_members,
        consent,
      },
    });

    return NextResponse.json({ success: true, id: registration.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" }, { status: 500 });
  }
}
