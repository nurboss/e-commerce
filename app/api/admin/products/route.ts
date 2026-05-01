import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { generateSlug } from "@/lib/utils";

const productVariantSchema = z.object({
  id: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  price: z.number().nonnegative().nullable().optional(),
  stock: z.number().int().nonnegative(),
});

const createProductSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().min(2),
  images: z.array(z.string().url()).default([]),
  videoUrl: z.string().url().optional().nullable(),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional().nullable(),
  categoryId: z.string().min(1),
  brandId: z.string().min(1),
  isFeatured: z.boolean().default(false),
  variants: z.array(productVariantSchema).default([]),
});

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const parsed = createProductSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload." }, { status: 400 });

  const payload = parsed.data;
  const baseSlug = payload.slug?.trim() || generateSlug(payload.name);
  const existing = await db.product.findUnique({ where: { slug: baseSlug }, select: { id: true } });
  const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;

  const product = await db.product.create({
    data: {
      name: payload.name,
      slug,
      description: payload.description,
      images: payload.images,
      videoUrl: payload.videoUrl ?? null,
      price: new Prisma.Decimal(payload.price),
      compareAtPrice: payload.compareAtPrice ? new Prisma.Decimal(payload.compareAtPrice) : null,
      categoryId: payload.categoryId,
      brandId: payload.brandId,
      isFeatured: payload.isFeatured,
      variants: {
        create: payload.variants.map((variant) => ({
          size: variant.size || null,
          color: variant.color || null,
          price: variant.price ? new Prisma.Decimal(variant.price) : null,
          stock: variant.stock,
        })),
      },
    },
    select: { id: true },
  });

  return NextResponse.json({ id: product.id });
}
