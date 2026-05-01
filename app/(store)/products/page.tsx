import Link from "next/link";
import { ProductCard } from "@/components/shared/product-card";
import { ProductsFilterForm } from "@/components/shared/products-filter-form";
import { getFilterOptions, getProducts } from "@/lib/catalog";

type ProductsPageProps = {
  searchParams: {
    q?: string;
    category?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    page?: string;
  };
};

const toPositiveNumber = (value?: string) => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

const createPageLink = (
  searchParams: ProductsPageProps["searchParams"],
  page: number,
) => {
  const params = new URLSearchParams();
  if (searchParams.q) params.set("q", searchParams.q);
  if (searchParams.category) params.set("category", searchParams.category);
  if (searchParams.brand) params.set("brand", searchParams.brand);
  if (searchParams.minPrice) params.set("minPrice", searchParams.minPrice);
  if (searchParams.maxPrice) params.set("maxPrice", searchParams.maxPrice);
  if (searchParams.inStock === "true") params.set("inStock", "true");
  params.set("page", String(page));
  return `/products?${params.toString()}`;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const currentPage = Math.max(Number(searchParams.page ?? "1") || 1, 1);
  const filters = {
    q: searchParams.q?.trim(),
    category: searchParams.category?.trim(),
    brand: searchParams.brand?.trim(),
    minPrice: toPositiveNumber(searchParams.minPrice),
    maxPrice: toPositiveNumber(searchParams.maxPrice),
    inStock: searchParams.inStock === "true",
    page: currentPage,
  };

  const [{ products, page, totalPages, total }, options] = await Promise.all([
    getProducts(filters),
    getFilterOptions(),
  ]);

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">Products</h1>
        <p className="mt-1 text-sm text-zinc-500">{total} products found</p>
      </div>

      <ProductsFilterForm
        categories={options.categories}
        brands={options.brands}
        current={{
          q: searchParams.q ?? "",
          category: searchParams.category ?? "",
          brand: searchParams.brand ?? "",
          minPrice: searchParams.minPrice ?? "",
          maxPrice: searchParams.maxPrice ?? "",
          inStock: searchParams.inStock === "true",
        }}
      />

      {products.length === 0 ? (
        <p className="rounded-lg border border-zinc-200 p-6 text-sm text-zinc-500 dark:border-zinc-800">
          No products match these filters.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <Link
          href={createPageLink(searchParams, Math.max(page - 1, 1))}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700"
          aria-disabled={page <= 1}
        >
          Previous
        </Link>
        <span className="text-sm text-zinc-500">
          Page {page} of {totalPages}
        </span>
        <Link
          href={createPageLink(searchParams, Math.min(page + 1, totalPages))}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700"
          aria-disabled={page >= totalPages}
        >
          Next
        </Link>
      </div>
    </section>
  );
}
