import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

type AdminCustomerDetailPageProps = {
  params: { id: string };
};

export default async function AdminCustomerDetailPage({ params }: AdminCustomerDetailPageProps) {
  const customer = await db.user.findUnique({
    where: { id: params.id },
    include: {
      orders: {
        include: { items: true },
        orderBy: { createdAt: "desc" },
      },
      addresses: true,
    },
  });
  if (!customer) notFound();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{customer.name ?? "Customer profile"}</h1>
        <p className="text-sm text-zinc-500">{customer.email ?? "No email"}</p>
      </div>

      <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-3 font-semibold">Addresses</h2>
        <div className="space-y-2 text-sm">
          {customer.addresses.length === 0 ? (
            <p className="text-zinc-500">No addresses saved.</p>
          ) : (
            customer.addresses.map((address) => (
              <p key={address.id}>
                {address.name} | {address.phone} | {address.line1}, {address.city}, {address.district}
              </p>
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-3 font-semibold">Orders</h2>
        <div className="space-y-2 text-sm">
          {customer.orders.map((order) => (
            <div key={order.id} className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
              <p className="font-medium">#{order.id}</p>
              <p className="text-zinc-500">
                {new Date(order.createdAt).toLocaleDateString()} | {order.status} | {order.paymentStatus}
              </p>
              <p>{formatPrice(Number(order.total))}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
