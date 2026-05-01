import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

const schema = z.object({
  email: z.string().email(),
  role: z.enum([UserRole.ADMIN, UserRole.STAFF]),
});

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session || session.user?.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Only ADMIN can manage staff." }, { status: 403 });
  }
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload." }, { status: 400 });

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  await db.user.update({
    where: { id: user.id },
    data: { role: parsed.data.role },
    select: { id: true },
  });
  return NextResponse.json({ ok: true });
}
