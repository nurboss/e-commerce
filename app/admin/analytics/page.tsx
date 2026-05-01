import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export default async function AdminAnalyticsPage() {
  const now = new Date();
  const last30 = new Date(now);
  last30.setDate(now.getDate() - 30);

  const orders = await db.order.findMany({
    where: { createdAt: { gte: last30 } },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });
  const orderItems = await db.orderItem.findMany({
    where: { order: { createdAt: { gte: last30 } } },
    include: { product: true, order: true },
  });

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  const productMap = new Map<string, { name: string; units: number; revenue: number }>();
  for (const item of orderItems) {
    const row = productMap.get(item.productId) ?? {
      name: item.product.name,
      units: 0,
      revenue: 0,
    };
    row.units += item.quantity;
    row.revenue += Number(item.price) * item.quantity;
    productMap.set(item.productId, row);
  }
  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const customerMap = new Map<string, { label: string; orders: number; spent: number }>();
  for (const order of orders) {
    const customerKey = order.userId ?? order.guestEmail ?? order.id;
    const label = order.user?.email ?? order.guestEmail ?? "Guest";
    const row = customerMap.get(customerKey) ?? { label, orders: 0, spent: 0 };
    row.orders += 1;
    row.spent += Number(order.total);
    customerMap.set(customerKey, row);
  }
  const topCustomers = Array.from(customerMap.values())
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 10);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-zinc-500">Sales performance for the last 30 days.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-xs text-zinc-500">Revenue (30 days)</p>
          <p className="mt-2 text-xl font-semibold">{formatPrice(totalRevenue)}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-xs text-zinc-500">Orders (30 days)</p>
          <p className="mt-2 text-xl font-semibold">{orders.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-xs text-zinc-500">Average order value</p>
          <p className="mt-2 text-xl font-semibold">{formatPrice(averageOrderValue)}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="mb-3 font-semibold">Top products</h2>
          <div className="space-y-2 text-sm">
            {topProducts.map((product) => (
              <div key={product.name} className="flex items-center justify-between rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
                <span>{product.name}</span>
                <span>
                  {product.units} sold | {formatPrice(product.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="mb-3 font-semibold">Top customers</h2>
          <div className="space-y-2 text-sm">
            {topCustomers.map((customer) => (
              <div key={customer.label} className="flex items-center justify-between rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
                <span>{customer.label}</span>
                <span>
                  {customer.orders} orders | {formatPrice(customer.spent)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
