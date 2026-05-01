import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { generateSlug } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  image: z.string().url().optional().nullable(),
  parentId: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  const payload = parsed.data;

  const baseSlug = payload.slug?.trim() || generateSlug(payload.name);
  const existing = await db.category.findUnique({ where: { slug: baseSlug }, select: { id: true } });
  const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;

  const category = await db.category.create({
    data: {
      name: payload.name,
      slug,
      image: payload.image ?? null,
      parentId: payload.parentId ?? null,
    },
    select: { id: true },
  });
  return NextResponse.json({ id: category.id });
}
