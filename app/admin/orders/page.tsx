import Link from "next/link";
import { OrderStatus, PaymentMethod } from "@prisma/client";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

type AdminOrdersPageProps = {
  searchParams: {
    q?: string;
    status?: OrderStatus;
    paymentMethod?: PaymentMethod;
  };
};

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const q = searchParams.q?.trim();
  const status = searchParams.status;
  const paymentMethod = searchParams.paymentMethod;
  const orders = await db.order.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { id: { contains: q, mode: "insensitive" } },
              { guestEmail: { contains: q, mode: "insensitive" } },
              { user: { email: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
      ...(status ? { status } : {}),
      ...(paymentMethod ? { paymentMethod } : {}),
    },
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="text-sm text-zinc-500">Track and manage all customer orders.</p>
      </div>
      <form className="grid gap-3 rounded-xl border border-zinc-200 p-4 text-sm dark:border-zinc-800 sm:grid-cols-4">
        <input
          name="q"
          defaultValue={searchParams.q ?? ""}
          placeholder="Search order ID or email"
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <select
          name="status"
          defaultValue={searchParams.status ?? ""}
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="">All status</option>
          {Object.values(OrderStatus).map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select
          name="paymentMethod"
          defaultValue={searchParams.paymentMethod ?? ""}
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="">All payment methods</option>
          {Object.values(PaymentMethod).map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <button className="rounded-md bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-100 dark:text-zinc-900">
          Filter
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr>
              <th className="p-3 text-left">Order ID</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Payment</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="p-3">
                  <Link href={`/admin/orders/${order.id}`} className="underline">
                    {order.id}
                  </Link>
                </td>
                <td className="p-3">{order.user?.email ?? order.guestEmail ?? "Guest"}</td>
                <td className="p-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="p-3">{formatPrice(Number(order.total))}</td>
                <td className="p-3">{order.paymentMethod}</td>
                <td className="p-3">{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
