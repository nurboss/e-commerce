import { db } from "@/lib/db";
import { InventoryAdjustForm } from "@/components/admin/inventory-adjust-form";

export default async function AdminInventoryPage() {
  const variants = await db.productVariant.findMany({
    include: { product: true, logs: { orderBy: { createdAt: "desc" }, take: 3 } },
    orderBy: { stock: "asc" },
    take: 100,
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Inventory</h1>
        <p className="text-sm text-zinc-500">Current variant stock and latest inventory adjustments.</p>
      </div>
      <div className="space-y-3">
        {variants.map((variant) => (
          <article key={variant.id} className="rounded-xl border border-zinc-200 p-4 text-sm dark:border-zinc-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{variant.product.name}</p>
              <span
                className={`rounded-full px-2 py-1 text-xs ${
                  variant.stock < 5 ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                }`}
              >
                Stock {variant.stock}
              </span>
            </div>
            <p className="mt-1 text-zinc-500">
              {(variant.size || "Default size") + " / " + (variant.color || "Default color")}
            </p>
            {variant.logs.length > 0 ? (
              <div className="mt-3 space-y-1 border-t border-zinc-200 pt-3 text-xs dark:border-zinc-800">
                {variant.logs.map((log) => (
                  <p key={log.id}>
                    {new Date(log.createdAt).toLocaleDateString()} | {log.change > 0 ? "+" : ""}
                    {log.change} ({log.reason})
                  </p>
                ))}
              </div>
            ) : null}
            <InventoryAdjustForm variantId={variant.id} />
          </article>
        ))}
      </div>
    </section>
  );
}
