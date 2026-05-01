import { CategoriesManager } from "@/components/admin/categories-manager";
import { db } from "@/lib/db";

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, image: true, parentId: true },
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Categories</h1>
        <p className="text-sm text-zinc-500">Create, edit, and organize category hierarchy.</p>
      </div>
      <CategoriesManager categories={categories} />
    </section>
  );
}
