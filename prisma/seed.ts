import { db } from "@/lib/db";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@prisma/client";
import "dotenv/config";
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Seeding database...");

  // ------------------------
  // Categories
  // ------------------------
  const electronics = await db.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: {
      name: "Electronics",
      slug: "electronics",
    },
  });

  const fashion = await db.category.upsert({
    where: { slug: "fashion" },
    update: {},
    create: {
      name: "Fashion",
      slug: "fashion",
    },
  });

  // ------------------------
  // Brands
  // ------------------------
  const apple = await db.brand.upsert({
    where: { slug: "apple" },
    update: {},
    create: {
      name: "Apple",
      slug: "apple",
    },
  });

  const nike = await db.brand.upsert({
    where: { slug: "nike" },
    update: {},
    create: {
      name: "Nike",
      slug: "nike",
    },
  });

  // ------------------------
  // Products
  // ------------------------
  const iphone = await db.product.upsert({
    where: { slug: "iphone-15" },
    update: {},
    create: {
      name: "iPhone 15",
      slug: "iphone-15",
      description: "Latest Apple iPhone with A16 chip",
      images: ["https://via.placeholder.com/600x600"],
      price: new Prisma.Decimal(1200),
      compareAtPrice: new Prisma.Decimal(1300),
      categoryId: electronics.id,
      brandId: apple.id,
      isFeatured: true,
      variants: {
        create: [
          {
            size: "128GB",
            color: "Black",
            stock: 10,
            price: new Prisma.Decimal(1200),
          },
          {
            size: "256GB",
            color: "Blue",
            stock: 5,
            price: new Prisma.Decimal(1350),
          },
        ],
      },
    },
    include: { variants: true },
  });

  const shoes = await db.product.upsert({
    where: { slug: "nike-air-max" },
    update: {},
    create: {
      name: "Nike Air Max",
      slug: "nike-air-max",
      description: "Comfortable running shoes",
      images: ["https://via.placeholder.com/600x600"],
      price: new Prisma.Decimal(150),
      compareAtPrice: new Prisma.Decimal(180),
      categoryId: fashion.id,
      brandId: nike.id,
      variants: {
        create: [
          {
            size: "42",
            color: "White",
            stock: 20,
          },
          {
            size: "43",
            color: "Black",
            stock: 15,
          },
        ],
      },
    },
  });

  // ------------------------
  // Test User
  // ------------------------
  const user = await db.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      name: "Test User",
      email: "test@example.com",
      password: "hashedpassword", // replace with bcrypt if needed
    },
  });

  // ------------------------
  // Cart (example)
  // ------------------------
  await db.cart.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      items: {
        create: [
          {
            productId: iphone.id,
            variantId: iphone.variants[0].id,
            quantity: 1,
          },
        ],
      },
    },
  });

  console.log("✅ Seeding completed");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
