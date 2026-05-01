import { BrandsManager } from "@/components/admin/brands-manager";
import { db } from "@/lib/db";

export default async function AdminBrandsPage() {
  const brands = await db.brand.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, logo: true },
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Brands</h1>
        <p className="text-sm text-zinc-500">Create and manage brand records and logos.</p>
      </div>
      <BrandsManager brands={brands} />
    </section>
  );
}
