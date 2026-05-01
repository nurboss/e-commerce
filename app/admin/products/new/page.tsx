import { redirect } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { db } from "@/lib/db";

export default async function AdminNewProductPage() {
  const [categories, brands] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (categories.length === 0 || brands.length === 0) {
    redirect("/admin/products");
  }

  return <ProductForm categories={categories} brands={brands} />;
}
