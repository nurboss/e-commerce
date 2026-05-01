"use client";

import { PaymentMethod } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";

type CartItem = {
  productId: string;
  quantity: number;
};

type ProductSnapshot = {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
};

type ShippingForm = {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  district: string;
  postalCode: string;
};

const CHECKOUT_STORAGE_KEY = "nur-checkout-draft";
const GIFT_WRAP_FEE = 50;
const SHIPPING_FEE = 120;

export const CheckoutClient = () => {
  const router = useRouter();
  const { items: storeItems, clear } = useCart();
  const [items, setItems] = useState<CartItem[]>(storeItems);
  const [products, setProducts] = useState<ProductSnapshot[]>([]);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.COD);
  const [couponCode, setCouponCode] = useState("");
  const [giftWrapping, setGiftWrapping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [shipping, setShipping] = useState<ShippingForm>({
    name: "",
    email: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    district: "",
    postalCode: "",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHECKOUT_STORAGE_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as {
        items?: CartItem[];
        couponCode?: string;
        giftWrapping?: boolean;
      };
      if (draft.items?.length) setItems(draft.items);
      if (draft.couponCode) setCouponCode(draft.couponCode);
      if (typeof draft.giftWrapping === "boolean") setGiftWrapping(draft.giftWrapping);
    } catch {
      // Ignore invalid local draft data.
    }
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      if (items.length === 0) {
        setProducts([]);
        return;
      }
      const response = await fetch("/api/products/by-ids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: items.map((item) => item.productId) }),
      });
      if (!response.ok) {
        setProducts([]);
        return;
      }
      const payload = (await response.json()) as { items?: ProductSnapshot[] };
      setProducts(payload.items ?? []);
    };

    void loadProducts();
  }, [items]);

  const rows = useMemo(
    () =>
      items
        .map((item) => ({
          item,
          product: products.find((product) => product.id === item.productId),
        }))
        .filter((row): row is { item: CartItem; product: ProductSnapshot } => Boolean(row.product)),
    [items, products],
  );

  const subtotal = rows.reduce((sum, row) => sum + row.product.price * row.item.quantity, 0);
  const discount = 0;
  const shippingFee = rows.length > 0 ? SHIPPING_FEE : 0;
  const total = Math.max(0, subtotal - discount + shippingFee + (giftWrapping ? GIFT_WRAP_FEE : 0));

  const shippingIsValid =
    shipping.name.trim().length > 1 &&
    shipping.email.includes("@") &&
    shipping.phone.trim().length >= 6 &&
    shipping.line1.trim().length > 2 &&
    shipping.city.trim().length > 1 &&
    shipping.district.trim().length > 1;

  const placeOrder = async () => {
    if (!shippingIsValid || rows.length === 0) {
      setError("Complete shipping details and keep at least one cart item.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/checkout/place-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shipping,
          paymentMethod,
          couponCode,
          giftWrapping,
        }),
      });
      const payload = (await response.json()) as { orderId?: string; error?: string };
      if (!response.ok || !payload.orderId) {
        setError(payload.error ?? "Could not place order.");
        return;
      }
      const orderId = payload.orderId;
      if (paymentMethod === PaymentMethod.COD) {
        clear();
        localStorage.removeItem(CHECKOUT_STORAGE_KEY);
        router.push(`/order/${orderId}/confirmation`);
        return;
      }

      const sessionEndpoint =
        paymentMethod === PaymentMethod.SSLCOMMERZ
          ? "/api/payment/sslcommerz/session"
          : "/api/payment/bkash/session";
      const paymentResponse = await fetch(sessionEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const paymentPayload = (await paymentResponse.json()) as {
        gatewayUrl?: string;
        error?: string;
      };
      if (!paymentResponse.ok || !paymentPayload.gatewayUrl) {
        setError(paymentPayload.error ?? "Failed to start payment session.");
        return;
      }
      clear();
      localStorage.removeItem(CHECKOUT_STORAGE_KEY);
      window.location.href = paymentPayload.gatewayUrl;
    } catch (err) {
      setError(String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (rows.length === 0) {
    return <p className="text-sm text-zinc-500">No cart items available for checkout.</p>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="space-y-6 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-xs">
          {[1, 2, 3].map((value) => (
            <span
              key={value}
              className={`rounded-full px-2 py-1 ${step === value ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "bg-zinc-100 dark:bg-zinc-900"}`}
            >
              Step {value}
            </span>
          ))}
        </div>

        {step === 1 ? (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Shipping</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" placeholder="Full name" value={shipping.name} onChange={(e) => setShipping((prev) => ({ ...prev, name: e.target.value }))} />
              <input className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" placeholder="Email" value={shipping.email} onChange={(e) => setShipping((prev) => ({ ...prev, email: e.target.value }))} />
              <input className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" placeholder="Phone" value={shipping.phone} onChange={(e) => setShipping((prev) => ({ ...prev, phone: e.target.value }))} />
              <input className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" placeholder="Address line 1" value={shipping.line1} onChange={(e) => setShipping((prev) => ({ ...prev, line1: e.target.value }))} />
              <input className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" placeholder="Address line 2 (optional)" value={shipping.line2} onChange={(e) => setShipping((prev) => ({ ...prev, line2: e.target.value }))} />
              <input className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" placeholder="City" value={shipping.city} onChange={(e) => setShipping((prev) => ({ ...prev, city: e.target.value }))} />
              <input className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" placeholder="District" value={shipping.district} onChange={(e) => setShipping((prev) => ({ ...prev, district: e.target.value }))} />
              <input className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" placeholder="Postal code (optional)" value={shipping.postalCode} onChange={(e) => setShipping((prev) => ({ ...prev, postalCode: e.target.value }))} />
            </div>
            <button type="button" onClick={() => setStep(2)} disabled={!shippingIsValid} className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900">
              Continue to payment
            </button>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Payment</h2>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2 rounded-md border border-zinc-300 p-3 dark:border-zinc-700">
                <input type="radio" name="payment-method" checked={paymentMethod === PaymentMethod.SSLCOMMERZ} onChange={() => setPaymentMethod(PaymentMethod.SSLCOMMERZ)} />
                SSLCommerz (online payment)
              </label>
              <label className="flex items-center gap-2 rounded-md border border-zinc-300 p-3 dark:border-zinc-700">
                <input type="radio" name="payment-method" checked={paymentMethod === PaymentMethod.BKASH} onChange={() => setPaymentMethod(PaymentMethod.BKASH)} />
                bKash (mobile wallet)
              </label>
              <label className="flex items-center gap-2 rounded-md border border-zinc-300 p-3 dark:border-zinc-700">
                <input type="radio" name="payment-method" checked={paymentMethod === PaymentMethod.COD} onChange={() => setPaymentMethod(PaymentMethod.COD)} />
                Cash on delivery
              </label>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setStep(1)} className="rounded-md border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700">
                Back
              </button>
              <button type="button" onClick={() => setStep(3)} className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900">
                Review order
              </button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-3 text-sm">
            <h2 className="text-lg font-semibold">Review</h2>
            <p>
              Shipping to {shipping.name}, {shipping.line1}, {shipping.city}, {shipping.district}
            </p>
            <p>Payment method: {paymentMethod}</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setStep(2)} className="rounded-md border border-zinc-300 px-4 py-2 dark:border-zinc-700">
                Back
              </button>
              <button type="button" onClick={placeOrder} disabled={isSubmitting} className="rounded-md bg-zinc-900 px-4 py-2 text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900">
                {isSubmitting ? "Placing order..." : "Place order"}
              </button>
            </div>
          </div>
        ) : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </section>

      <aside className="h-fit space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-lg font-semibold">Order summary</h2>
        <div className="space-y-2 text-sm">
          {rows.map((row) => (
            <div key={row.product.id} className="flex items-center justify-between gap-3">
              <p className="line-clamp-1 flex-1">
                {row.product.name} x {row.item.quantity}
              </p>
              <span>{formatPrice(row.product.price * row.item.quantity)}</span>
            </div>
          ))}
        </div>
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={giftWrapping}
            onChange={(event) => setGiftWrapping(event.target.checked)}
          />
          Gift wrapping (+{formatPrice(GIFT_WRAP_FEE)})
        </label>
        <div className="space-y-1 border-t border-zinc-200 pt-3 text-sm dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Discount</span>
            <span>-{formatPrice(discount)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Shipping</span>
            <span>{formatPrice(shippingFee)}</span>
          </div>
          <p className="flex items-center justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </p>
        </div>
      </aside>
    </div>
  );
};
