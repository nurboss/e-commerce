import { CompareClient } from "@/components/shared/compare-client";

export default function ComparePage() {
  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">Compare Products</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Compare selected products side by side to choose the best fit.
        </p>
      </div>
      <CompareClient />
    </section>
  );
}
