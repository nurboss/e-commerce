import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export default async function AdminCustomersPage() {
  const customers = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      orders: {
        select: { total: true },
      },
    },
    take: 200,
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Customers</h1>
        <p className="text-sm text-zinc-500">View customers, order counts, and lifetime value.</p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Orders</th>
              <th className="p-3 text-left">Total spent</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => {
              const totalSpent = customer.orders.reduce((sum, order) => sum + Number(order.total), 0);
              return (
                <tr key={customer.id} className="border-t border-zinc-200 dark:border-zinc-800">
                  <td className="p-3">
                    <Link href={`/admin/customers/${customer.id}`} className="underline">
                      {customer.name ?? "Unnamed"}
                    </Link>
                  </td>
                  <td className="p-3">{customer.email ?? "No email"}</td>
                  <td className="p-3">{customer.orders.length}</td>
                  <td className="p-3">{formatPrice(totalSpent)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
