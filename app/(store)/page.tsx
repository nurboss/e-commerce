import Link from "next/link";

export default function HomePage() {
  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12">
      <p className="text-sm uppercase tracking-wide text-zinc-500">NUR Store</p>
      <h1 className="text-3xl font-bold leading-tight md:text-5xl">
        Bangladesh-focused e-commerce platform
      </h1>
      <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
        Foundation is in place and the storefront modules are now scaffolded. Continue with Phase 2
        implementation flow from products listing to checkout.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/products"
          className="rounded-md bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Browse products
        </Link>
        <Link href="/admin" className="rounded-md border border-zinc-300 px-4 py-2 dark:border-zinc-700">
          Go to admin
        </Link>
      </div>
    </section>
  );
}
