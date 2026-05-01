import { CheckoutClient } from "@/components/shared/checkout-client";

type CheckoutPageProps = {
  searchParams: {
    payment?: string;
    orderId?: string;
  };
};

export default function CheckoutPage({ searchParams }: CheckoutPageProps) {
  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Complete shipping details, choose payment method, and review your order.
        </p>
        {searchParams.payment === "failed" ? (
          <p className="mt-2 text-sm text-red-600">
            Payment failed for order {searchParams.orderId ?? "unknown"}. Please try again.
          </p>
        ) : null}
      </div>
      <CheckoutClient />
    </section>
  );
}
