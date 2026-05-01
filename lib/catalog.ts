import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

const PAGE_SIZE = 12;

export type ProductFilters = {
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
};

export const productPageSize = PAGE_SIZE;

const toNumber = (value: Prisma.Decimal | null) => {
  if (!value) return null;
  return Number(value);
};

export const getFilterOptions = async () => {
  const [categories, brands] = await Promise.all([
    db.category.findMany({
      where: { products: { some: { isArchived: false } } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    db.brand.findMany({
      where: { products: { some: { isArchived: false } } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  return { categories, brands };
};

export const getProducts = async (filters: ProductFilters) => {
  const page = Math.max(filters.page ?? 1, 1);
  const where: Prisma.ProductWhereInput = {
    isArchived: false,
    ...(filters.q
      ? {
          OR: [
            { name: { contains: filters.q, mode: "insensitive" } },
            { description: { contains: filters.q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(filters.category ? { category: { slug: filters.category } } : {}),
    ...(filters.brand ? { brand: { slug: filters.brand } } : {}),
    ...(typeof filters.minPrice === "number" || typeof filters.maxPrice === "number"
      ? {
          price: {
            ...(typeof filters.minPrice === "number" ? { gte: filters.minPrice } : {}),
            ...(typeof filters.maxPrice === "number" ? { lte: filters.maxPrice } : {}),
          },
        }
      : {}),
    ...(filters.inStock ? { variants: { some: { stock: { gt: 0 } } } } : {}),
  };

  const [items, total] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.product.count({ where }),
  ]);

  return {
    products: items.map((item) => {
      const ratingCount = item.reviews.length;
      const rating =
        ratingCount > 0
          ? item.reviews.reduce((sum, review) => sum + review.rating, 0) / ratingCount
          : 0;
      return {
        id: item.id,
        slug: item.slug,
        name: item.name,
        image: item.images[0] ?? "https://placehold.co/600x600/png",
        price: Number(item.price),
        compareAtPrice: toNumber(item.compareAtPrice),
        rating,
      };
    }),
    total,
    page,
    totalPages: Math.max(Math.ceil(total / PAGE_SIZE), 1),
  };
};

export const getProductBySlug = async (slug: string) => {
  return db.product.findUnique({
    where: { slug },
    include: {
      category: true,
      brand: true,
      variants: true,
      reviews: {
        include: {
          user: { select: { id: true, name: true, image: true } },
          photos: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
};

export const getInstantSearchProducts = async (q: string) => {
  if (!q.trim()) return [];
  const products = await db.product.findMany({
    where: {
      isArchived: false,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    },
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      name: true,
      images: true,
      price: true,
    },
  });

  return products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    image: product.images[0] ?? "https://placehold.co/160x160/png",
    price: Number(product.price),
  }));
};

export const getProductsByIds = async (ids: string[]) => {
  if (ids.length === 0) return [];
  const products = await db.product.findMany({
    where: { id: { in: ids }, isArchived: false },
    select: {
      id: true,
      slug: true,
      name: true,
      images: true,
      price: true,
      compareAtPrice: true,
    },
  });

  return ids
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is NonNullable<typeof product> => Boolean(product))
    .map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0] ?? "https://placehold.co/600x600/png",
      price: Number(product.price),
      compareAtPrice: toNumber(product.compareAtPrice),
      rating: 0,
    }));
};
