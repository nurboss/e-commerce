"use client";

import Image from "next/image";
import Link from "next/link";
import { StarRating } from "@/components/shared/star-rating";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { useCompare } from "@/hooks/use-compare";
import { useWishlist } from "@/hooks/use-wishlist";

type ProductCardProps = {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  compareAtPrice?: number | null;
  rating?: number;
};

export const ProductCard = ({
  id,
  slug,
  name,
  image,
  price,
  compareAtPrice,
  rating = 0,
}: ProductCardProps) => {
  const { addItem } = useCart();
  const { productIds, toggleItem } = useWishlist();
  const { productIds: compareProductIds, toggleProduct } = useCompare();
  const isWishlisted = productIds.includes(id);
  const isComparing = compareProductIds.includes(id);

  return (
    <article className="space-y-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
      <Link href={`/products/${slug}`} className="block overflow-hidden rounded-lg">
        <Image
          src={image}
          alt={name}
          width={500}
          height={500}
          className="aspect-square w-full object-cover transition-transform duration-200 hover:scale-105"
        />
      </Link>

      <div className="space-y-2">
        <Link href={`/products/${slug}`} className="line-clamp-2 text-sm font-medium">
          {name}
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold">{formatPrice(price)}</span>
          {compareAtPrice ? (
            <span className="text-zinc-500 line-through">{formatPrice(compareAtPrice)}</span>
          ) : null}
        </div>
        <StarRating rating={rating} />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          className="rounded-md border border-zinc-300 px-3 py-2 text-xs dark:border-zinc-700"
          onClick={() => toggleItem(id)}
        >
          {isWishlisted ? "Wishlisted" : "Wishlist"}
        </button>
        <button
          type="button"
          className="rounded-md border border-zinc-300 px-3 py-2 text-xs dark:border-zinc-700"
          onClick={() => toggleProduct(id)}
        >
          {isComparing ? "Compared" : "Compare"}
        </button>
        <button
          type="button"
          className="rounded-md bg-zinc-900 px-3 py-2 text-xs text-white dark:bg-zinc-100 dark:text-zinc-900"
          onClick={() => addItem({ productId: id, quantity: 1 })}
        >
          Add to cart
        </button>
      </div>
    </article>
  );
};
