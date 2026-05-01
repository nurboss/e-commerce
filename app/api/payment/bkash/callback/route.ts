import { NextResponse } from "next/server";
import { markPaymentFailed, markPaymentSucceeded } from "@/lib/payments";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");
  const status = searchParams.get("status");

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId." }, { status: 400 });
  }

  if (status === "success") {
    await markPaymentSucceeded(orderId);
    return NextResponse.redirect(new URL(`/order/${orderId}/confirmation`, request.url));
  }

  await markPaymentFailed(orderId);
  return NextResponse.redirect(new URL(`/checkout?payment=failed&orderId=${orderId}`, request.url));
}
