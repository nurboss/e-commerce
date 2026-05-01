import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

const callbackBase = env.NEXT_PUBLIC_APP_URL;

export const createPaymentSessionUrl = (paymentMethod: PaymentMethod, orderId: string) => {
  const provider = paymentMethod === PaymentMethod.SSLCOMMERZ ? "sslcommerz" : "bkash";
  const callbackUrl = new URL(`/api/payment/${provider}/callback`, callbackBase);
  callbackUrl.searchParams.set("orderId", orderId);
  callbackUrl.searchParams.set("status", "success");
  return callbackUrl.toString();
};

export const markPaymentSucceeded = async (orderId: string) => {
  return db.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: PaymentStatus.PAID,
      status: OrderStatus.PROCESSING,
    },
    select: { id: true },
  });
};

export const markPaymentFailed = async (orderId: string) => {
  return db.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: PaymentStatus.UNPAID,
      status: OrderStatus.PENDING,
    },
    select: { id: true },
  });
};
