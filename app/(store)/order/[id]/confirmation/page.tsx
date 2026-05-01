import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

type OrderConfirmationPageProps = {
  params: { id: string };
};

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const order = await db.order.findUnique({
    where: { id: params.id },
    include: {
      items: true,
    },
  });
  if (!order) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <p className="text-sm text-emerald-600">Order placed successfully</p>
        <h1 className="mt-1 text-2xl font-semibold">Order #{order.id}</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Payment method: {order.paymentMethod} | Payment status: {order.paymentStatus}
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-lg font-semibold">Items</h2>
        <div className="mt-3 space-y-2 text-sm">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3">
              <p className="flex-1">
                {item.name} x {item.quantity}
              </p>
              <span>{formatPrice(Number(item.price) * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1 border-t border-zinc-200 pt-3 text-sm dark:border-zinc-800">
          <p className="flex items-center justify-between">
            <span className="text-zinc-500">Discount</span>
            <span>-{formatPrice(Number(order.discount))}</span>
          </p>
          <p className="flex items-center justify-between">
            <span className="text-zinc-500">Shipping fee</span>
            <span>{formatPrice(Number(order.shippingFee))}</span>
          </p>
          <p className="flex items-center justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(Number(order.total))}</span>
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          href="/products"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
        >
          Continue shopping
        </Link>
        <Link
          href="/account"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Go to account
        </Link>
      </div>
    </section>
  );
}
