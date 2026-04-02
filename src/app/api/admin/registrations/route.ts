import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const search = searchParams.get("search") || "";
  const all = searchParams.get("all") === "true"; // flag for exporting all

  const whereClause: Prisma.RegistrationWhereInput = { deleted_at: { equals: null } };

  if (startDate && endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    whereClause.created_at = {
      gte: start,
      lte: end,
    };
  }

  if (search) {
    whereClause.OR = [
      { code: { contains: search } },
      { name: { contains: search } },
      { memberType: { contains: search } },
      { tel: { contains: search } },
      { member_type_name: { contains: search } },
      { member_sub_type_name: { contains: search } }
    ];
  }

  // Count total records matching criteria
  const total = await prisma.registration.count({ where: whereClause });

  // Query data
  const registrations = await prisma.registration.findMany({
    where: whereClause,
    orderBy: { submitted_at: "desc" },
    ...(all ? {} : {
      skip: (page - 1) * limit,
      take: limit,
    }),
    select: {
      id: true,
      code: true,
      name: true,
      tel: true,
      email: true,
      memberType: true,
      member_type_name: true,
      member_sub_type_name: true,
      service_rate: true,
      quantity: true,
      total_amount: true,
      joined_members: true,
      slip_path: true,
      status: true,
      submitted_at: true,
    },
  });

  const data = registrations.map((r) => ({
    ...r,
    service_rate: Number(r.service_rate),
    total_amount: Number(r.total_amount),
  }));

  return NextResponse.json({ data, total });
}
