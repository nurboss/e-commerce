import { OrderStatus, PaymentStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const updateOrderSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  refund: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  context: { params: { id: string } },
) {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "ADMIN" && role !== "STAFF") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const parsed = updateOrderSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const data: { status?: OrderStatus; paymentStatus?: PaymentStatus } = {};
  if (parsed.data.status) data.status = parsed.data.status;
  if (parsed.data.refund) {
    data.status = OrderStatus.REFUNDED;
    data.paymentStatus = PaymentStatus.REFUNDED;
  }

  const order = await db.order.update({
    where: { id: context.params.id },
    data,
    select: { id: true, status: true, paymentStatus: true },
  });

  return NextResponse.json({ order });
}
