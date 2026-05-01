"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCompare } from "@/hooks/use-compare";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";

type CompareProduct = {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  compareAtPrice?: number | null;
  rating?: number;
};

export const CompareClient = () => {
  const { productIds, removeProduct, clear } = useCompare();
  const { addItem } = useCart();
  const [products, setProducts] = useState<CompareProduct[]>([]);

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
      const payload = (await response.json()) as { items?: CompareProduct[] };
      setProducts(payload.items ?? []);
    };
    void loadProducts();
  }, [productIds]);

  const orderedProducts = useMemo(
    () =>
      productIds
        .map((id) => products.find((product) => product.id === id))
        .filter((product): product is CompareProduct => Boolean(product)),
    [productIds, products],
  );

  if (productIds.length < 2) {
    return (
      <div className="rounded-xl border border-zinc-200 p-6 text-sm text-zinc-500 dark:border-zinc-800">
        Add at least two products to compare from the product cards.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">Comparing {orderedProducts.length} products (max 4)</p>
        <button
          type="button"
          className="rounded-md border border-zinc-300 px-3 py-1 text-sm dark:border-zinc-700"
          onClick={clear}
        >
          Clear all
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <tbody>
            <tr>
              <th className="w-40 border border-zinc-200 p-3 text-left dark:border-zinc-800">Product</th>
              {orderedProducts.map((product) => (
                <td key={product.id} className="min-w-64 border border-zinc-200 p-3 align-top dark:border-zinc-800">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={220}
                    height={220}
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                  <Link href={`/products/${product.slug}`} className="mt-2 block font-medium">
                    {product.name}
                  </Link>
                </td>
              ))}
            </tr>
            <tr>
              <th className="border border-zinc-200 p-3 text-left dark:border-zinc-800">Price</th>
              {orderedProducts.map((product) => (
                <td key={product.id} className="border border-zinc-200 p-3 dark:border-zinc-800">
                  <p className="font-medium">{formatPrice(product.price)}</p>
                  {product.compareAtPrice ? (
                    <p className="text-xs text-zinc-500 line-through">{formatPrice(product.compareAtPrice)}</p>
                  ) : null}
                </td>
              ))}
            </tr>
            <tr>
              <th className="border border-zinc-200 p-3 text-left dark:border-zinc-800">Actions</th>
              {orderedProducts.map((product) => (
                <td key={product.id} className="space-y-2 border border-zinc-200 p-3 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => addItem({ productId: product.id, quantity: 1 })}
                    className="w-full rounded-md bg-zinc-900 px-3 py-2 text-xs text-white dark:bg-zinc-100 dark:text-zinc-900"
                  >
                    Add to cart
                  </button>
                  <button
                    type="button"
                    onClick={() => removeProduct(product.id)}
                    className="w-full rounded-md border border-zinc-300 px-3 py-2 text-xs dark:border-zinc-700"
                  >
                    Remove
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
