import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

const schema = z.object({
  variantId: z.string().min(1),
  change: z.number().int().refine((value) => value !== 0),
  reason: z.string().min(2),
});

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  const payload = parsed.data;

  const variant = await db.productVariant.findUnique({
    where: { id: payload.variantId },
    select: { stock: true },
  });
  if (!variant) return NextResponse.json({ error: "Variant not found." }, { status: 404 });
  if (variant.stock + payload.change < 0) {
    return NextResponse.json({ error: "Stock cannot go below zero." }, { status: 400 });
  }

  await db.$transaction([
    db.productVariant.update({
      where: { id: payload.variantId },
      data: { stock: { increment: payload.change } },
    }),
    db.inventoryLog.create({
      data: {
        variantId: payload.variantId,
        change: payload.change,
        reason: payload.reason,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
