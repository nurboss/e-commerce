import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ProductDetailClient } from "@/components/shared/product-detail-client";
import { getProductBySlug } from "@/lib/catalog";
import { env } from "@/lib/env";
import { formatPrice } from "@/lib/utils";

type ProductDetailPageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product || product.isArchived) {
    return {
      title: "Product not found | NUR Store",
    };
  }
  const title = `${product.name} | NUR Store`;
  const description = product.description.slice(0, 160);
  const image = product.images[0] ?? "https://placehold.co/1200x630/png";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [image],
      type: "website",
      url: `${env.NEXT_PUBLIC_APP_URL}/products/${product.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = await getProductBySlug(params.slug);
  if (!product || product.isArchived) notFound();

  const averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0;

  return (
    <section className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            image: product.images,
            description: product.description,
            sku: product.id,
            brand: {
              "@type": "Brand",
              name: product.brand.name,
            },
            aggregateRating:
              product.reviews.length > 0
                ? {
                    "@type": "AggregateRating",
                    ratingValue: averageRating.toFixed(1),
                    reviewCount: product.reviews.length,
                  }
                : undefined,
            offers: {
              "@type": "Offer",
              priceCurrency: "BDT",
              price: Number(product.price),
              availability:
                product.variants.some((variant) => variant.stock > 0)
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
              url: `${env.NEXT_PUBLIC_APP_URL}/products/${product.slug}`,
            },
          }),
        }}
      />
      <Breadcrumb
        items={[
          { href: "/products", label: "Products" },
          { href: `/products?category=${product.category.slug}`, label: product.category.name },
          { href: `/products?brand=${product.brand.slug}`, label: product.brand.name },
          { href: `/products/${product.slug}`, label: product.name },
        ]}
      />

      <ProductDetailClient
        productId={product.id}
        name={product.name}
        basePrice={Number(product.price)}
        images={product.images}
        variants={product.variants.map((variant) => ({
          id: variant.id,
          size: variant.size,
          color: variant.color,
          stock: variant.stock,
          price: variant.price ? Number(variant.price) : null,
        }))}
      />

      {product.videoUrl ? (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Product Video</h2>
          <video src={product.videoUrl} controls className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800" />
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Description</h2>
          <p className="text-zinc-600 dark:text-zinc-400">{product.description}</p>
        </div>

        <div className="space-y-2 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="text-xl font-semibold">Reviews Snapshot</h2>
          <p className="text-sm text-zinc-500">
            {averageRating.toFixed(1)} average rating from {product.reviews.length} reviews
          </p>
          <div className="space-y-3">
            {product.reviews.slice(0, 3).map((review) => (
              <div key={review.id} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                <p className="text-sm font-medium">{review.title ?? "Customer review"}</p>
                <p className="text-xs text-zinc-500">
                  {review.user.name ?? "Anonymous"} - {review.rating}/5
                </p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{review.body}</p>
              </div>
            ))}
            {product.reviews.length === 0 ? (
              <p className="text-sm text-zinc-500">No reviews yet.</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 p-4 text-sm dark:border-zinc-800">
        Base price: {formatPrice(Number(product.price))}
      </div>
    </section>
  );
}
