import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export default async function AccountPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return null;
  }

  const [orders, recentOrderItems] = await Promise.all([
    db.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.orderItem.findMany({
      where: { order: { userId } },
      include: { product: true },
      orderBy: { order: { createdAt: "desc" } },
      take: 30,
    }),
  ]);

  const purchasedProductIds = Array.from(new Set(recentOrderItems.map((item) => item.productId)));
  const preferredCategories = Array.from(
    new Set(recentOrderItems.map((item) => item.product.categoryId).filter(Boolean)),
  );
  const preferredBrands = Array.from(
    new Set(recentOrderItems.map((item) => item.product.brandId).filter(Boolean)),
  );

  const recommended = await db.product.findMany({
    where: {
      isArchived: false,
      id: { notIn: purchasedProductIds },
      OR: [
        { categoryId: { in: preferredCategories.length > 0 ? preferredCategories : ["__none__"] } },
        { brandId: { in: preferredBrands.length > 0 ? preferredBrands : ["__none__"] } },
      ],
    },
    take: 6,
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, slug: true, price: true },
  });

  return (
    <section className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Account</h1>
          <p className="mt-1 text-sm text-zinc-500">Manage your profile, orders, and addresses.</p>
        </div>
        <Link
          href="/account/settings"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
        >
          Account settings
        </Link>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Order history</h2>
        </div>
        {orders.length === 0 ? (
          <p className="rounded-lg border border-zinc-200 p-4 text-sm text-zinc-500 dark:border-zinc-800">
            No orders yet.
          </p>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">Order #{order.id}</p>
                  <p className="text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <p className="mt-1 text-zinc-500">
                  Status: {order.status} | Payment: {order.paymentStatus}
                </p>
                <p className="mt-1">Total: {formatPrice(Number(order.total))}</p>
                <Link
                  href={`/order/${order.id}/confirmation`}
                  className="mt-2 inline-block text-xs underline"
                >
                  View order detail
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recommended for you</h2>
        {recommended.length === 0 ? (
          <p className="rounded-lg border border-zinc-200 p-4 text-sm text-zinc-500 dark:border-zinc-800">
            Browse more products to improve recommendations.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800"
              >
                <p className="font-medium">{product.name}</p>
                <p className="mt-1 text-zinc-500">{formatPrice(Number(product.price))}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
