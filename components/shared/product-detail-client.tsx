"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";

type ProductVariantItem = {
  id: string;
  size: string | null;
  color: string | null;
  price: number | null;
  stock: number;
};

type ProductDetailClientProps = {
  productId: string;
  name: string;
  basePrice: number;
  images: string[];
  variants: ProductVariantItem[];
};

export const ProductDetailClient = ({
  productId,
  name,
  basePrice,
  images,
  variants,
}: ProductDetailClientProps) => {
  const { addItem } = useCart();
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [variantId, setVariantId] = useState<string>(variants[0]?.id ?? "");

  const selectedVariant = useMemo(
    () => variants.find((variant) => variant.id === variantId),
    [variantId, variants],
  );
  const stock = selectedVariant?.stock ?? 0;
  const price = selectedVariant?.price ?? basePrice;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          <Image
            src={images[imageIndex] ?? "https://placehold.co/900x900/png"}
            alt={name}
            width={900}
            height={900}
            priority
            className="aspect-square w-full object-cover transition-transform duration-200 hover:scale-110"
          />
        </div>
        <div className="grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              className="overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800"
              onClick={() => setImageIndex(index)}
            >
              <Image src={image} alt={`${name} ${index + 1}`} width={160} height={160} className="aspect-square w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <h1 className="text-3xl font-semibold">{name}</h1>
          <p className="mt-2 text-xl font-semibold">{formatPrice(price)}</p>
        </div>

        {variants.length > 0 ? (
          <div className="space-y-2">
            <label className="block text-sm font-medium">Variant</label>
            <select
              value={variantId}
              onChange={(event) => setVariantId(event.target.value)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              {variants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {[variant.size, variant.color].filter(Boolean).join(" / ") || "Default"} - stock{" "}
                  {variant.stock}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="space-y-2">
          <label className="block text-sm font-medium">Quantity</label>
          <input
            type="number"
            min={1}
            max={Math.max(stock, 1)}
            value={quantity}
            onChange={(event) =>
              setQuantity(Math.max(1, Math.min(Number(event.target.value) || 1, Math.max(stock, 1))))
            }
            className="w-32 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <p className="text-xs text-zinc-500">Available stock: {stock}</p>
        </div>

        <button
          type="button"
          disabled={stock <= 0}
          onClick={() => addItem({ productId, quantity })}
          className="rounded-md bg-zinc-900 px-5 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {stock > 0 ? "Add to cart" : "Out of stock"}
        </button>
      </div>
    </div>
  );
};
