import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, blogs] = await Promise.all([
    db.product.findMany({
      where: { isArchived: false },
      select: { slug: true, updatedAt: true },
    }),
    db.category.findMany({
      select: { slug: true },
    }),
    db.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const baseUrl = env.NEXT_PUBLIC_APP_URL;

  return [
    { url: `${baseUrl}/`, lastModified: new Date() },
    { url: `${baseUrl}/products`, lastModified: new Date() },
    { url: `${baseUrl}/blog`, lastModified: new Date() },
    ...categories.map((category) => ({
      url: `${baseUrl}/products?category=${category.slug}`,
      lastModified: new Date(),
    })),
    ...products.map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: product.updatedAt,
    })),
    ...blogs.map((blog) => ({
      url: `${baseUrl}/blog/${blog.slug}`,
      lastModified: blog.updatedAt,
    })),
  ];
}
