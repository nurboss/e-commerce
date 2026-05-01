import { WishlistClient } from "@/components/shared/wishlist-client";

export default function WishlistPage() {
  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">Wishlist</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Save favorite products and move them to your cart anytime.
        </p>
      </div>
      <WishlistClient />
    </section>
  );
}
