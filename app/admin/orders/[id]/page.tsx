import { notFound } from "next/navigation";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

type AdminOrderDetailPageProps = {
  params: { id: string };
};

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const order = await db.order.findUnique({
    where: { id: params.id },
    include: { items: true, user: true },
  });
  if (!order) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Order #{order.id}</h1>
        <p className="text-sm text-zinc-500">
          Customer: {order.user?.email ?? order.guestEmail ?? "Guest"}
        </p>
      </div>

      <OrderStatusForm orderId={order.id} currentStatus={order.status} />

      <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-3 font-semibold">Items</h2>
        <div className="space-y-2 text-sm">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>{formatPrice(Number(item.price) * item.quantity)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
