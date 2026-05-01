import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

export async function PATCH(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });
  if (!user?.password) {
    return NextResponse.json({ error: "Password login is not configured for this account." }, { status: 400 });
  }

  const matches = await bcrypt.compare(parsed.data.currentPassword, user.password);
  if (!matches) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  }

  const hashed = await bcrypt.hash(parsed.data.newPassword, 12);
  await db.user.update({
    where: { id: userId },
    data: { password: hashed },
    select: { id: true },
  });

  return NextResponse.json({ ok: true });
}
