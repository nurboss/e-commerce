import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { db } from "@/lib/db";

type AdminEditProductPageProps = {
  params: { id: string };
};

export default async function AdminEditProductPage({ params }: AdminEditProductPageProps) {
  const [categories, brands, product] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.product.findUnique({
      where: { id: params.id },
      include: { variants: true },
    }),
  ]);

  if (!product) notFound();

  return (
    <ProductForm
      categories={categories}
      brands={brands}
      initial={{
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        images: product.images,
        videoUrl: product.videoUrl,
        price: Number(product.price),
        compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
        categoryId: product.categoryId,
        brandId: product.brandId,
        isFeatured: product.isFeatured,
        isArchived: product.isArchived,
        variants: product.variants.map((variant) => ({
          id: variant.id,
          size: variant.size,
          color: variant.color,
          price: variant.price ? Number(variant.price) : null,
          stock: variant.stock,
        })),
      }}
    />
  );
}
