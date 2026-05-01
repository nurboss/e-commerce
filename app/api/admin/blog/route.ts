import { BlogStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { generateSlug } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(2),
  slug: z.string().optional(),
  coverImage: z.string().url().optional().nullable(),
  body: z.string().min(2),
  tags: z.array(z.string()).default([]),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  status: z.nativeEnum(BlogStatus).default(BlogStatus.DRAFT),
});

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session?.user?.id) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload." }, { status: 400 });

  const baseSlug = parsed.data.slug?.trim() || generateSlug(parsed.data.title);
  const existing = await db.blogPost.findUnique({ where: { slug: baseSlug }, select: { id: true } });
  const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;

  const post = await db.blogPost.create({
    data: {
      title: parsed.data.title,
      slug,
      coverImage: parsed.data.coverImage ?? null,
      body: parsed.data.body,
      tags: parsed.data.tags,
      metaTitle: parsed.data.metaTitle ?? null,
      metaDescription: parsed.data.metaDescription ?? null,
      status: parsed.data.status,
      publishedAt: parsed.data.status === BlogStatus.PUBLISHED ? new Date() : null,
      authorId: session.user.id,
    },
    select: { id: true },
  });
  return NextResponse.json({ id: post.id });
}
