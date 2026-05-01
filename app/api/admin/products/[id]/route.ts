import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { generateSlug } from "@/lib/utils";

const variantSchema = z.object({
  id: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  price: z.number().nonnegative().nullable().optional(),
  stock: z.number().int().nonnegative(),
});

const updateSchema = z.object({
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
  isArchived: z.boolean().default(false),
  variants: z.array(variantSchema).default([]),
});

export async function PATCH(request: Request, context: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  const payload = parsed.data;

  const current = await db.product.findUnique({
    where: { id: context.params.id },
    include: { variants: true },
  });
  if (!current) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  const preferredSlug = payload.slug?.trim() || generateSlug(payload.name);
  const slugConflict = await db.product.findFirst({
    where: { slug: preferredSlug, id: { not: context.params.id } },
    select: { id: true },
  });
  const slug = slugConflict ? `${preferredSlug}-${Date.now()}` : preferredSlug;

  const incomingWithId = payload.variants.filter((variant) => variant.id);
  const incomingIds = new Set(incomingWithId.map((variant) => variant.id as string));
  const deleteIds = current.variants.filter((variant) => !incomingIds.has(variant.id)).map((variant) => variant.id);

  const product = await db.$transaction(async (tx) => {
    if (deleteIds.length > 0) {
      await tx.productVariant.deleteMany({ where: { id: { in: deleteIds } } });
    }

    for (const variant of incomingWithId) {
      await tx.productVariant.update({
        where: { id: variant.id as string },
        data: {
          size: variant.size || null,
          color: variant.color || null,
          price: variant.price ? new Prisma.Decimal(variant.price) : null,
          stock: variant.stock,
        },
      });
    }

    const newVariants = payload.variants.filter((variant) => !variant.id);
    if (newVariants.length > 0) {
      await tx.productVariant.createMany({
        data: newVariants.map((variant) => ({
          productId: context.params.id,
          size: variant.size || null,
          color: variant.color || null,
          price: variant.price ? new Prisma.Decimal(variant.price) : null,
          stock: variant.stock,
        })),
      });
    }

    return tx.product.update({
      where: { id: context.params.id },
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
        isArchived: payload.isArchived,
      },
      select: { id: true },
    });
  });

  return NextResponse.json({ id: product.id });
}
