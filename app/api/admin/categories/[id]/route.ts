import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { generateSlug } from "@/lib/utils";

const updateSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  image: z.string().url().optional().nullable(),
  parentId: z.string().optional().nullable(),
});

export async function PATCH(request: Request, context: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload." }, { status: 400 });

  const preferredSlug = parsed.data.slug?.trim() || generateSlug(parsed.data.name);
  const conflict = await db.category.findFirst({
    where: { slug: preferredSlug, id: { not: context.params.id } },
    select: { id: true },
  });
  const slug = conflict ? `${preferredSlug}-${Date.now()}` : preferredSlug;

  const category = await db.category.update({
    where: { id: context.params.id },
    data: {
      name: parsed.data.name,
      slug,
      image: parsed.data.image ?? null,
      parentId: parsed.data.parentId ?? null,
    },
    select: { id: true },
  });
  return NextResponse.json({ id: category.id });
}

export async function DELETE(_request: Request, context: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  await db.category.delete({ where: { id: context.params.id } });
  return NextResponse.json({ ok: true });
}
