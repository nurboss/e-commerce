import { DiscountType, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

const schema = z.object({
  code: z.string().min(2),
  discountType: z.nativeEnum(DiscountType),
  discountValue: z.number().positive(),
  minOrderAmount: z.number().nonnegative().optional().nullable(),
  maxUses: z.number().int().positive().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  isActive: z.boolean().default(true),
});

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload." }, { status: 400 });

  const payload = parsed.data;
  const coupon = await db.coupon.create({
    data: {
      code: payload.code.toUpperCase(),
      discountType: payload.discountType,
      discountValue: new Prisma.Decimal(payload.discountValue),
      minOrderAmount: payload.minOrderAmount ? new Prisma.Decimal(payload.minOrderAmount) : null,
      maxUses: payload.maxUses ?? null,
      expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : null,
      isActive: payload.isActive,
    },
    select: { id: true },
  });
  return NextResponse.json({ id: coupon.id });
}
