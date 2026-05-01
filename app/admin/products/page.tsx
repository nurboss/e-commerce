import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    include: { category: true, brand: true, variants: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Products</h1>
        <p className="text-sm text-zinc-500">Manage product catalog, visibility, and stock status.</p>
        <div className="mt-3 flex gap-2">
          <Link
            href="/admin/products/new"
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Create product
          </Link>
          <Link
            href="/admin/categories"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
          >
            Manage categories
          </Link>
          <Link
            href="/admin/brands"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
          >
            Manage brands
          </Link>
        </div>
      </div>
      <div className="space-y-3">
        {products.map((product) => (
          <article key={product.id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Image
                src={product.images[0] ?? "https://placehold.co/300x300/png"}
                alt={product.name}
                width={96}
                height={96}
                className="h-24 w-24 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-zinc-500">
                  {product.category.name} | {product.brand.name}
                </p>
                <p className="mt-1 text-sm">{formatPrice(Number(product.price))}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {product.variants.length} variants | {product.isArchived ? "Archived" : "Active"}
                </p>
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="mt-2 inline-block text-xs underline"
                >
                  Edit product
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
