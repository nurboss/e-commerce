"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";

type ProductSnapshot = {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
};

const CHECKOUT_STORAGE_KEY = "nur-checkout-draft";
const GIFT_WRAP_FEE = 50;
const SHIPPING_FEE = 120;

export const CartClient = () => {
  const { items, addItem, removeItem } = useCart();
  const [products, setProducts] = useState<ProductSnapshot[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [giftWrapping, setGiftWrapping] = useState(false);

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

  const cartRows = useMemo(
    () =>
      items
        .map((item) => ({
          item,
          product: products.find((product) => product.id === item.productId),
        }))
        .filter((row): row is { item: (typeof items)[number]; product: ProductSnapshot } =>
          Boolean(row.product),
        ),
    [items, products],
  );

  const subtotal = cartRows.reduce(
    (sum, row) => sum + row.product.price * row.item.quantity,
    0,
  );
  const shippingFee = subtotal > 0 ? SHIPPING_FEE : 0;
  const total = Math.max(
    0,
    subtotal - discount + shippingFee + (giftWrapping ? GIFT_WRAP_FEE : 0),
  );

  useEffect(() => {
    if (!couponCode.trim()) {
      setDiscount(0);
      setCouponError("");
    }
  }, [couponCode]);

  const applyCoupon = async () => {
    const code = couponCode.trim();
    if (!code || subtotal <= 0) {
      setDiscount(0);
      setCouponError("Add items before applying a coupon.");
      return;
    }

    setCouponLoading(true);
    setCouponError("");
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const payload = (await response.json()) as { discount?: number; error?: string };
      if (!response.ok || typeof payload.discount !== "number") {
        setDiscount(0);
        setCouponError(payload.error ?? "Could not apply coupon.");
        return;
      }
      setDiscount(payload.discount);
    } catch (error) {
      setDiscount(0);
      setCouponError(String(error));
    } finally {
      setCouponLoading(false);
    }
  };

  const proceedToCheckout = () => {
    const draft = {
      items,
      couponCode: couponCode.trim(),
      discount,
      giftWrapping,
    };
    localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(draft));
  };

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
        <p className="text-sm text-zinc-500">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cartRows.map((row) => (
        <article
          key={row.item.productId}
          className="flex flex-col gap-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800 sm:flex-row"
        >
          <Image
            src={row.product.image}
            alt={row.product.name}
            width={120}
            height={120}
            className="h-28 w-28 rounded-lg object-cover"
          />
          <div className="flex-1 space-y-2">
            <Link href={`/products/${row.product.slug}`} className="font-medium">
              {row.product.name}
            </Link>
            <p className="text-sm text-zinc-500">{formatPrice(row.product.price)}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  row.item.quantity > 1
                    ? addItem({
                        productId: row.item.productId,
                        quantity: row.item.quantity - 1,
                      })
                    : removeItem(row.item.productId)
                }
                className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700"
              >
                -
              </button>
              <span className="text-sm">{row.item.quantity}</span>
              <button
                type="button"
                onClick={() =>
                  addItem({
                    productId: row.item.productId,
                    quantity: row.item.quantity + 1,
                  })
                }
                className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => removeItem(row.item.productId)}
                className="ml-3 rounded border border-red-300 px-2 py-1 text-sm text-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        </article>
      ))}

      <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <p className="text-sm text-zinc-500">Coupon code</p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={couponCode}
            onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
            placeholder="Enter coupon"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="button"
            onClick={applyCoupon}
            disabled={couponLoading}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
          >
            {couponLoading ? "Applying..." : "Apply"}
          </button>
        </div>
        {couponError ? <p className="mt-2 text-xs text-red-600">{couponError}</p> : null}
        {discount > 0 ? (
          <p className="mt-2 text-xs text-emerald-600">Coupon applied: -{formatPrice(discount)}</p>
        ) : null}

        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={giftWrapping}
            onChange={(event) => setGiftWrapping(event.target.checked)}
          />
          Add gift wrapping (+{formatPrice(GIFT_WRAP_FEE)})
        </label>

        <div className="mt-4 space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Discount</span>
            <span>-{formatPrice(discount)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Shipping fee</span>
            <span>{formatPrice(shippingFee)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Gift wrapping</span>
            <span>{formatPrice(giftWrapping ? GIFT_WRAP_FEE : 0)}</span>
          </div>
        </div>
        <p className="mt-3 text-sm text-zinc-500">Total</p>
        <p className="text-xl font-semibold">{formatPrice(total)}</p>
        <Link
          href="/checkout"
          onClick={proceedToCheckout}
          className="mt-3 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Continue to checkout
        </Link>
      </div>
    </div>
  );
};
