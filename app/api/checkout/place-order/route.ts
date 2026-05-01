import { PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { GIFT_WRAP_FEE, resolveCouponDiscount } from "@/lib/checkout";
import { db } from "@/lib/db";

const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

const schema = z.object({
  items: z.array(cartItemSchema).min(1),
  shipping: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(6),
    line1: z.string().min(3),
    line2: z.string().optional(),
    city: z.string().min(2),
    district: z.string().min(2),
    postalCode: z.string().optional(),
  }),
  paymentMethod: z.nativeEnum(PaymentMethod),
  couponCode: z.string().optional(),
  giftWrapping: z.boolean().default(false),
});

const toFixed2 = (value: number) => Number(value.toFixed(2));

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid checkout payload." }, { status: 400 });
    }

    const session = await auth();
    const uniqueProductIds = [...new Set(parsed.data.items.map((item) => item.productId))];
    const products = await db.product.findMany({
      where: { id: { in: uniqueProductIds }, isArchived: false },
      select: {
        id: true,
        name: true,
        images: true,
        price: true,
      },
    });
    if (products.length !== uniqueProductIds.length) {
      return NextResponse.json({ error: "One or more products are unavailable." }, { status: 400 });
    }

    const productMap = new Map(products.map((product) => [product.id, product]));
    const lineItems = parsed.data.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error("Product mismatch during checkout.");
      }
      return {
        productId: item.productId,
        quantity: item.quantity,
        name: product.name,
        image: product.images[0] ?? null,
        price: Number(product.price),
      };
    });

    const subtotal = toFixed2(
      lineItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    );
    const shippingFee = subtotal >= 1500 ? 0 : 120;
    const coupon = parsed.data.couponCode
      ? await resolveCouponDiscount(parsed.data.couponCode, subtotal)
      : null;
    const discount = coupon ? toFixed2(coupon.discount) : 0;
    const giftWrapping = parsed.data.giftWrapping;
    const total = toFixed2(
      Math.max(0, subtotal - discount + shippingFee + (giftWrapping ? GIFT_WRAP_FEE : 0)),
    );

    const shipping = parsed.data.shipping;
    const shippingSnapshot = [
      `Name: ${shipping.name}`,
      `Email: ${shipping.email}`,
      `Phone: ${shipping.phone}`,
      `Address 1: ${shipping.line1}`,
      `Address 2: ${shipping.line2 ?? "-"}`,
      `City: ${shipping.city}`,
      `District: ${shipping.district}`,
      `Postal Code: ${shipping.postalCode ?? "-"}`,
    ].join("\n");

    const order = await db.$transaction(async (tx) => {
      if (coupon) {
        await tx.coupon.update({
          where: { code: coupon.code },
          data: { usedCount: { increment: 1 } },
        });
      }

      return tx.order.create({
        data: {
          userId: session?.user?.id ?? null,
          guestEmail: session?.user?.id ? null : shipping.email,
          guestPhone: session?.user?.id ? null : shipping.phone,
          paymentMethod: parsed.data.paymentMethod,
          paymentStatus: PaymentStatus.UNPAID,
          total: new Prisma.Decimal(total),
          discount: new Prisma.Decimal(discount),
          shippingFee: new Prisma.Decimal(shippingFee),
          couponCode: coupon?.code ?? null,
          giftWrapping,
          notes: shippingSnapshot,
          items: {
            create: lineItems.map((item) => ({
              productId: item.productId,
              name: item.name,
              image: item.image,
              price: new Prisma.Decimal(item.price),
              quantity: item.quantity,
            })),
          },
        },
        select: { id: true },
      });
    });

    return NextResponse.json({ orderId: order.id, total });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to place order.", detail: String(error) },
      { status: 500 },
    );
  }
}
