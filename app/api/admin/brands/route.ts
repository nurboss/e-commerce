import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { generateSlug } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  logo: z.string().url().optional().nullable(),
});

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload." }, { status: 400 });

  const baseSlug = parsed.data.slug?.trim() || generateSlug(parsed.data.name);
  const existing = await db.brand.findUnique({ where: { slug: baseSlug }, select: { id: true } });
  const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;

  const brand = await db.brand.create({
    data: {
      name: parsed.data.name,
      slug,
      logo: parsed.data.logo ?? null,
    },
    select: { id: true },
  });
  return NextResponse.json({ id: brand.id });
}
