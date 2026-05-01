import { DiscountType } from "@prisma/client";
import { db } from "@/lib/db";

export const GIFT_WRAP_FEE = 50;

export const resolveCouponDiscount = async (
  couponCode: string,
  subtotal: number,
) => {
  const normalized = couponCode.trim().toUpperCase();
  if (!normalized) {
    return null;
  }

  const coupon = await db.coupon.findUnique({
    where: { code: normalized },
  });
  if (!coupon || !coupon.isActive) {
    return null;
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return null;
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return null;
  }
  if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
    return null;
  }

  const value = Number(coupon.discountValue);
  const discount =
    coupon.discountType === DiscountType.PERCENTAGE
      ? (subtotal * value) / 100
      : value;

  return {
    code: coupon.code,
    discount: Math.max(0, Math.min(discount, subtotal)),
  };
};
