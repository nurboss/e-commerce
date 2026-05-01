import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export async function DELETE(_request: Request, context: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session || session.user?.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Only ADMIN can manage staff." }, { status: 403 });
  }

  await db.user.update({
    where: { id: context.params.id },
    data: { role: UserRole.CUSTOMER },
    select: { id: true },
  });

  return NextResponse.json({ ok: true });
}
