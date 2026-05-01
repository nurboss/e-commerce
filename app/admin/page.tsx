import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const [todayRevenueAgg, totalOrders, newCustomersToday, totalProducts, recentOrders, lowStockVariants] =
    await Promise.all([
      db.order.aggregate({
        where: { createdAt: { gte: startOfDay } },
        _sum: { total: true },
      }),
      db.order.count(),
      db.user.count({ where: { createdAt: { gte: startOfDay } } }),
      db.product.count({ where: { isArchived: false } }),
      db.order.findMany({
        include: { user: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      db.productVariant.findMany({
        where: { stock: { lt: 5 }, product: { isArchived: false } },
        include: { product: true },
        orderBy: { stock: "asc" },
        take: 10,
      }),
    ]);

  const bestSelling = await db.orderItem.groupBy({
    by: ["productId"],
    where: { order: { createdAt: { gte: thirtyDaysAgo } } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  });
  const bestSellingProducts = await db.product.findMany({
    where: { id: { in: bestSelling.map((item) => item.productId) } },
    select: { id: true, name: true },
  });
  const bestSellingRows = bestSelling.map((item) => ({
    productId: item.productId,
    units: item._sum.quantity ?? 0,
    name:
      bestSellingProducts.find((product) => product.id === item.productId)?.name ??
      "Unknown product",
  }));

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-zinc-500">Overview of sales, operations, and stock health.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-xs text-zinc-500">Today's revenue</p>
          <p className="mt-2 text-xl font-semibold">
            {formatPrice(Number(todayRevenueAgg._sum.total ?? 0))}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-xs text-zinc-500">Total orders</p>
          <p className="mt-2 text-xl font-semibold">{totalOrders}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-xs text-zinc-500">New customers today</p>
          <p className="mt-2 text-xl font-semibold">{newCustomersToday}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-xs text-zinc-500">Active products</p>
          <p className="mt-2 text-xl font-semibold">{totalProducts}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Recent orders</h2>
            <Link href="/admin/orders" className="text-xs underline">
              View all
            </Link>
          </div>
          <div className="space-y-2 text-sm">
            {recentOrders.map((order) => (
              <div key={order.id} className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
                <p className="font-medium">#{order.id}</p>
                <p className="text-zinc-500">{order.user?.email ?? order.guestEmail ?? "Guest"}</p>
                <p>{formatPrice(Number(order.total))}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="mb-3 font-semibold">Low stock alerts</h2>
          <div className="space-y-2 text-sm">
            {lowStockVariants.length === 0 ? (
              <p className="text-zinc-500">No low stock variants right now.</p>
            ) : (
              lowStockVariants.map((variant) => (
                <div key={variant.id} className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
                  <p className="font-medium">{variant.product.name}</p>
                  <p className="text-zinc-500">
                    {(variant.size || "Default size") + " / " + (variant.color || "Default color")}
                  </p>
                  <p>Stock: {variant.stock}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-3 font-semibold">Best-selling products (30 days)</h2>
        <div className="space-y-2 text-sm">
          {bestSellingRows.length === 0 ? (
            <p className="text-zinc-500">Not enough order data yet.</p>
          ) : (
            bestSellingRows.map((row) => (
              <div key={row.productId} className="flex items-center justify-between rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
                <span>{row.name}</span>
                <span className="font-medium">{row.units} units</span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
