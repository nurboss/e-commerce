import { ProductCard } from "@/components/shared/product-card";
import { getProducts } from "@/lib/catalog";

type SearchPageProps = {
  searchParams: { q?: string };
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const q = searchParams.q?.trim() ?? "";
  const { products, total } = await getProducts({ q, page: 1 });

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">Search results</h1>
        <p className="text-sm text-zinc-500">
          {q ? `${total} result(s) for "${q}"` : "Type in the navbar search to find products."}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </section>
  );
}
