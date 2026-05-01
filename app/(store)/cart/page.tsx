import { CartClient } from "@/components/shared/cart-client";

export default function CartPage() {
  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">Shopping Cart</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Update quantities, remove items, and proceed to checkout.
        </p>
      </div>
      <CartClient />
    </section>
  );
}
