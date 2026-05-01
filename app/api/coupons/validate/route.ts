import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveCouponDiscount } from "@/lib/checkout";

const schema = z.object({
  code: z.string().min(1),
  subtotal: z.number().nonnegative(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const coupon = await resolveCouponDiscount(parsed.data.code, parsed.data.subtotal);
    if (!coupon) {
      return NextResponse.json({ error: "Invalid or expired coupon." }, { status: 400 });
    }

    return NextResponse.json(coupon);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to validate coupon.", detail: String(error) },
      { status: 500 },
    );
  }
}
