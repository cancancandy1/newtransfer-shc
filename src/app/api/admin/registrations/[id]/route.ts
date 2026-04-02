import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: paramId } = params;
  const id = parseInt(paramId, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { status, isDeleted } = body;

    const dataToUpdate: Prisma.RegistrationUpdateInput = {};

    if (status) {
      if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      dataToUpdate.status = status;
    }

    if (isDeleted) {
      await prisma.registration.delete({
        where: { id },
      });
      return NextResponse.json({
        message: "Deleted successfully",
        status: "DELETED",
      });
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ error: "No data to update" }, { status: 400 });
    }

    const updated = await prisma.registration.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({
      message: "Updated successfully",
      status: updated.status,
    });
  } catch (error) {
    console.error("Error updating registration:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
