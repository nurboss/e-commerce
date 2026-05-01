import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createPaymentSessionUrl } from "@/lib/payments";

const schema = z.object({
  orderId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { id: parsed.data.orderId },
      select: { id: true, paymentMethod: true, paymentStatus: true },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    if (order.paymentMethod !== PaymentMethod.BKASH) {
      return NextResponse.json({ error: "Order is not bKash payment." }, { status: 400 });
    }
    if (order.paymentStatus !== PaymentStatus.UNPAID) {
      return NextResponse.json({ error: "Order is already paid." }, { status: 400 });
    }

    const gatewayUrl = createPaymentSessionUrl(PaymentMethod.BKASH, order.id);
    return NextResponse.json({ gatewayUrl });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to initialize bKash payment.", detail: String(error) },
      { status: 500 },
    );
  }
}
