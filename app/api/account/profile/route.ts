import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const updateProfileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  image: z.string().url().optional().or(z.literal("")),
});

export async function PATCH(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const user = await db.user.update({
    where: { id: userId },
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      image: parsed.data.image || null,
    },
    select: { id: true, name: true, email: true, image: true },
  });

  return NextResponse.json({ user });
}
