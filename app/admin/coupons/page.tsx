import { CouponsManager } from "@/components/admin/coupons-manager";
import { db } from "@/lib/db";

export default async function AdminCouponsPage() {
  const coupons = await db.coupon.findMany({
    orderBy: { code: "asc" },
    select: {
      id: true,
      code: true,
      discountType: true,
      discountValue: true,
      minOrderAmount: true,
      maxUses: true,
      usedCount: true,
      expiresAt: true,
      isActive: true,
    },
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Coupons</h1>
        <p className="text-sm text-zinc-500">Create and manage promotional coupon codes.</p>
      </div>
      <CouponsManager
        coupons={coupons.map((coupon) => ({
          id: coupon.id,
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: Number(coupon.discountValue),
          minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : null,
          maxUses: coupon.maxUses,
          usedCount: coupon.usedCount,
          expiresAt: coupon.expiresAt?.toISOString() ?? null,
          isActive: coupon.isActive,
        }))}
      />
    </section>
  );
}
