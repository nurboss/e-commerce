"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { formatPrice } from "@/lib/utils";

type ProductSnapshot = {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
};

export const WishlistClient = () => {
  const { productIds, toggleItem } = useWishlist();
  const { addItem } = useCart();
  const [products, setProducts] = useState<ProductSnapshot[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      if (productIds.length === 0) {
        setProducts([]);
        return;
      }
      const response = await fetch("/api/products/by-ids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: productIds }),
      });
      if (!response.ok) {
        setProducts([]);
        return;
      }
      const payload = (await response.json()) as { items?: ProductSnapshot[] };
      setProducts(payload.items ?? []);
    };

    void loadProducts();
  }, [productIds]);

  if (productIds.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
        <p className="text-sm text-zinc-500">Your wishlist is empty.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <article key={product.id} className="space-y-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
          <Image
            src={product.image}
            alt={product.name}
            width={500}
            height={500}
            className="aspect-square w-full rounded-lg object-cover"
          />
          <Link href={`/products/${product.slug}`} className="line-clamp-2 text-sm font-medium">
            {product.name}
          </Link>
          <p className="text-sm text-zinc-500">{formatPrice(product.price)}</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => addItem({ productId: product.id, quantity: 1 })}
              className="rounded-md bg-zinc-900 px-3 py-2 text-xs text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Move to cart
            </button>
            <button
              type="button"
              onClick={() => toggleItem(product.id)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-xs dark:border-zinc-700"
            >
              Remove
            </button>
          </div>
        </article>
      ))}
    </div>
  );
};
