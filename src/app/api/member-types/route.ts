import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const types = await prisma.memberType.findMany({
    where: { is_active: true },
    select: { 
      id: true, 
      name: true, 
      description: true,
      sub_types: {
        where: { is_active: true },
        select: { id: true, name: true, service_rate: true }
      }
    },
    orderBy: { id: "asc" },
  });

  // แปลง Decimal เป็น number สำหรับ sub_types
  const result = types.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    sub_types: t.sub_types.map((st) => ({
      id: st.id,
      name: st.name,
      service_rate: Number(st.service_rate)
    }))
  }));

  return NextResponse.json(result);
}
