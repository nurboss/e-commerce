# 🛒 E-Commerce Platform — Full Cursor Master Prompt
# Copy everything below this line into your Cursor chat

---

You are a senior full-stack engineer and solutions architect. I am building a production-grade e-commerce platform. Below is the complete specification. Your job is to help me build this step by step, making expert decisions on architecture, file structure, and best practices.

---

## Tech Stack

- Framework: Next.js 14 (App Router)
- UI: shadcn/ui + Tailwind CSS
- Database ORM: Prisma
- Database: PostgreSQL (hosted on Supabase)
- File Storage: Supabase Storage (images & videos)
- Language: TypeScript (strict mode)
- Auth: NextAuth.js v5 (email + Google OAuth)
- Payments: SSL Commerz, bKash, Cash on Delivery
- Email: Resend
- State Management: Zustand (cart, wishlist, UI state)
- Search: Prisma full-text search (upgrade to Algolia later)
- PWA: next-pwa
- i18n: next-intl (English + Bengali)
- Analytics: Vercel Analytics + custom admin dashboard

---

## Project Name

[YOUR_STORE_NAME] — an online retail platform targeting Bangladeshi customers.

---

## Coding Standards

- Always use TypeScript with strict types. Never use `any`.
- Use server components by default. Only add `"use client"` when using hooks, browser APIs, or event handlers.
- All API routes go in `/app/api/[route]/route.ts`.
- Use Prisma for all DB access. No raw SQL unless absolutely necessary.
- All forms use react-hook-form + zod for validation.
- Error handling must be explicit — never swallow errors silently.
- Follow Next.js 14 App Router conventions strictly.
- Use shadcn/ui components as the base; extend with Tailwind, never override with custom CSS files.
- Write reusable components in `/components/ui/` (shadcn base) and `/components/shared/` (app-level shared).
- Every page must be mobile-first and fully responsive.
- Use `next/image` for all images with proper `width`, `height`, and `priority` props.
- Environment variables must be validated with zod in `/lib/env.ts`. Never access `process.env` directly outside that file.
- File names: kebab-case for files, PascalCase for React components, camelCase for functions/variables.
- Prefer named exports for components. Use default export only for page files.
- Always handle loading and error states in UI components.

---

## Environment Variables

Create `.env.local` with the following (also create `.env.example` with the same keys but empty values and helpful comments):

```
# App
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Supabase (DB + Storage)
DATABASE_URL=                          # Supabase PostgreSQL connection string (Transaction mode, port 6543)
DIRECT_URL=                            # Supabase direct connection string (port 5432, used by Prisma migrate)
NEXT_PUBLIC_SUPABASE_URL=              # e.g. https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=         # public anon key (safe for client)
SUPABASE_SERVICE_ROLE_KEY=             # secret service role key (server-side only, never expose to client)

# Payments
SSLCOMMERZ_STORE_ID=
SSLCOMMERZ_STORE_PASS=
SSLCOMMERZ_IS_LIVE=false               # set to true in production
BKASH_APP_KEY=
BKASH_APP_SECRET=
BKASH_USERNAME=
BKASH_PASSWORD=
BKASH_BASE_URL=                        # sandbox or production URL

# Email
RESEND_API_KEY=

# App URL (used for absolute URLs in emails, sitemaps, OG images)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Supabase Storage — Image & File Upload System

Use Supabase Storage as the single file storage provider for all images and videos across the platform.

### Supabase Storage Setup

Install the Supabase client:
```
npm install @supabase/supabase-js
```

Create two Supabase clients in `/lib/supabase.ts`:
1. A **browser client** using `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` — used in client components for authenticated uploads.
2. A **server/admin client** using `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` — used in API routes for server-side operations and deleting files. Never expose this key to the browser.

```ts
// /lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

// Client-side (safe to expose)
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server-side only (never import in client components)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

### Supabase Storage Bucket Setup

Create a single public bucket called `ecommerce` in the Supabase dashboard (Storage → New bucket → name: `ecommerce` → Public: ON).

Then organise uploads using folder prefixes inside that bucket:

| Folder path              | Used for                        | Max file size | Allowed types          |
|--------------------------|---------------------------------|---------------|------------------------|
| `products/`              | Product images and videos       | 20 MB         | image/*, video/*       |
| `reviews/`               | Customer review photos          | 5 MB          | image/*                |
| `blog/`                  | Blog post cover images          | 5 MB          | image/*                |
| `avatars/`               | User profile pictures           | 2 MB          | image/*                |
| `categories/`            | Category banner images          | 5 MB          | image/*                |
| `brands/`                | Brand logo images               | 2 MB          | image/*                |

Set the following RLS policies on the `ecommerce` bucket in Supabase:
- **SELECT (read)**: public — anyone can read (bucket is public)
- **INSERT (upload)**: authenticated users only, OR use a server-side API route that uses the service role key for unauthenticated cases (e.g. guest review photos)
- **DELETE**: service role only (handled server-side)

### Upload API Route

Create `/app/api/upload/route.ts` as a `POST` endpoint:
- Accepts `multipart/form-data` with fields: `file` (the file), `folder` (e.g. `"products"`), `filename` (optional custom name)
- Server-side validation:
  - File must be an image (`image/*`) or video (`video/*`) depending on folder
  - Max size: 20 MB for products, 5 MB for reviews/blog/categories, 2 MB for avatars/brands
  - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `video/mp4`, `video/webm`
- Generate a unique filename: `${folder}/${Date.now()}-${randomUUID()}.${ext}`
- Upload to Supabase Storage using `supabaseAdmin.storage.from("ecommerce").upload(path, buffer, { contentType })`
- Return the public URL using `supabaseAdmin.storage.from("ecommerce").getPublicUrl(path)`
- Return JSON: `{ url: string, path: string }`
- Require authentication for product, blog, category, brand, avatar uploads
- Allow unauthenticated uploads only for the `reviews/` folder

### Delete Helper

Create `/lib/storage.ts` with:
```ts
// deleteFile(path: string): deletes a file from Supabase Storage by its storage path
// getPublicUrl(path: string): returns the full public URL for a given storage path
// uploadFile(file: File, folder: string): client-side upload helper using supabaseBrowser
```

When a product, review, blog post, or user is deleted from the DB, also delete the associated Supabase Storage files to prevent orphaned files.

### Reusable Upload Component

Create `/components/shared/image-uploader.tsx` — a `"use client"` component with these props:
```ts
interface ImageUploaderProps {
  folder: "products" | "reviews" | "blog" | "avatars" | "categories" | "brands";
  multiple?: boolean;        // default false
  maxFiles?: number;         // default 1
  accept?: string;           // default "image/*"
  onUpload: (urls: string[]) => void;
  existingUrls?: string[];   // show already-uploaded images for edit forms
}
```

The component must:
- Show a styled drag-and-drop zone using `react-dropzone`
- Show a file size and type error message if validation fails (client-side check before upload)
- Show a progress indicator per file during upload (call `POST /api/upload`)
- Display image previews after upload with an (×) remove button
- For `multiple={true}` allow drag-to-reorder previews
- On remove, call `DELETE /api/upload` with the storage path to clean up Supabase Storage
- Call `onUpload(urls)` with the array of public URLs whenever the list changes

### Where Uploads Are Used

Implement the `<ImageUploader />` component in all of these locations:

**1. Admin — Product Form** (`/app/admin/products/new` and `/app/admin/products/[id]/edit`)
- Up to 10 product images (first = thumbnail), drag to reorder
- 1 optional product video
- Store image URLs as `String[]` in `Product.images` in Prisma
- Store video URL as `String?` in `Product.videoUrl`
```tsx
<ImageUploader folder="products" multiple maxFiles={10} onUpload={...} />
```

**2. Storefront — Review Form** (on product detail page)
- Up to 5 photos per review
- Stored in `ReviewPhoto` model
```tsx
<ImageUploader folder="reviews" multiple maxFiles={5} onUpload={...} />
```

**3. Admin — Blog Post Editor** (`/app/admin/blog/new` and `/app/admin/blog/[id]/edit`)
- Single cover image
- Stored in `BlogPost.coverImage`
```tsx
<ImageUploader folder="blog" multiple={false} onUpload={...} />
```

**4. Account Settings — User Avatar** (`/app/(store)/account/settings`)
- Single image upload, square crop
- Stored in `User.image`
```tsx
<ImageUploader folder="avatars" multiple={false} onUpload={...} />
```

**5. Admin — Category Management** (`/app/admin/categories`)
- Single banner image per category
- Stored in `Category.image`
```tsx
<ImageUploader folder="categories" multiple={false} onUpload={...} />
```

**6. Admin — Brand Management** (`/app/admin/brands`)
- Single logo per brand
- Stored in `Brand.logo`
```tsx
<ImageUploader folder="brands" multiple={false} onUpload={...} />
```

### Displaying Images

Always use `next/image` with Supabase public URLs. Add the Supabase domain to `next.config.ts`:
```ts
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "*.supabase.co",
      pathname: "/storage/v1/object/public/**",
    },
  ],
},
```

Supabase Storage does not do on-the-fly transformations like Cloudinary. For resizing, use the Supabase Image Transformation API (available on Pro plan) by appending `?width=400&height=400&resize=cover` to the URL, or use `next/image` `sizes` prop and let Next.js handle resizing via its image optimizer.

---

## Database Schema (Prisma)

Create the full schema in `/prisma/schema.prisma`. Configure two URLs for Supabase:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")    // Transaction mode (port 6543)
  directUrl = env("DIRECT_URL")      // Direct connection (port 5432)
}
```

Design all models to support:

- **User** — id, name, email, password (hashed), image (avatar URL), role (CUSTOMER | ADMIN | STAFF), emailVerified, createdAt
- **Account, Session, VerificationToken** — NextAuth.js Prisma adapter required models
- **Product** — id, name, slug (unique), description, images (String[]), videoUrl, price, compareAtPrice, categoryId, brandId, isFeatured, isArchived, createdAt
- **ProductVariant** — id, productId, size, color, price (optional override), stock
- **Category** — id, name, slug, image, parentId (self-relation for subcategories)
- **Brand** — id, name, slug, logo
- **Order** — id, userId (nullable for guest), guestEmail, guestPhone, status (PENDING | PROCESSING | SHIPPED | DELIVERED | CANCELLED | REFUNDED), paymentMethod (SSLCOMMERZ | BKASH | COD), paymentStatus (UNPAID | PAID | REFUNDED), total, discount, shippingFee, couponCode, giftWrapping, notes, createdAt
- **OrderItem** — id, orderId, productId, variantId, name (snapshot), image (snapshot), price (snapshot), quantity
- **Address** — id, userId, name, phone, line1, line2, city, district, postalCode, isDefault
- **Cart** — id, userId (nullable), sessionId (for guests), items relation
- **CartItem** — id, cartId, productId, variantId, quantity
- **Wishlist** — id, userId
- **WishlistItem** — id, wishlistId, productId
- **Review** — id, userId, productId, rating (1-5), title, body, isVerifiedPurchase, helpfulCount, createdAt
- **ReviewPhoto** — id, reviewId, url
- **Question** — id, userId, productId, body, createdAt
- **Answer** — id, questionId, userId, body, createdAt
- **Coupon** — id, code (unique), discountType (PERCENTAGE | FIXED), discountValue, minOrderAmount, maxUses, usedCount, expiresAt, isActive
- **Inventory** — track stock per ProductVariant (stock field on ProductVariant is sufficient; add InventoryLog for audit trail)
- **InventoryLog** — id, variantId, change (positive or negative), reason, createdAt
- **Notification** — id, userId, title, body, isRead, createdAt
- **BlogPost** — id, title, slug, coverImage, body (rich text HTML), authorId, status (DRAFT | PUBLISHED), tags (String[]), metaTitle, metaDescription, publishedAt

Add proper indexes on all foreign keys and frequently-queried fields (slug, email, orderId, status).

---

## Full Feature Specification

### 🛍️ Storefront — Shopping Features

- Product listing page with server-side filtering: category, brand, price range, rating, in-stock only
- Filter state stored in URL search params (shareable and bookmarkable)
- Pagination using shadcn Pagination component
- ProductCard component: image, name, price, original price (strikethrough if compareAtPrice exists), star rating, wishlist toggle button, add-to-cart button
- Skeleton loading state for product grid
- Product detail page:
  - Image gallery with zoom on hover (CSS `transform: scale` or react-image-magnify)
  - Video player in gallery if videoUrl exists
  - Variant selector (size, color) — selecting a variant updates displayed price and stock
  - Quantity selector — max value = available stock for selected variant
  - Add to Cart button and Add to Wishlist button
  - Breadcrumb navigation (Category > Brand > Product)
  - Tabbed section: Description | Specifications | Reviews | Q&A
  - Related products (same category, exclude current product)
  - Recently viewed products stored in localStorage, shown at bottom of page
  - Social sharing: Facebook, WhatsApp, copy link
- Full-text product search with 300ms debounce
- Instant search dropdown showing top 5 results (image, name, price)
- Full search results page at `/search?q=...`
- Wishlist page at `/wishlist` — move item to cart, remove item
- Product comparison: floating bar (appears when 2+ products selected for comparison), comparison page at `/compare` showing specs side by side (max 4 products)

### 🛒 Cart & Checkout

- Persistent shopping cart:
  - Logged-in users: cart stored in DB (`Cart` + `CartItem` models)
  - Guests: cart stored in localStorage with a session ID
  - On login, merge localStorage cart into DB cart
- Cart page at `/cart`:
  - Item list with quantity controls (+ / −) and remove button
  - Coupon code input — validate against DB, show discount amount
  - Gift wrapping checkbox (add a fixed fee, e.g. ৳50)
  - Order summary: subtotal, coupon discount, gift wrapping, shipping fee, total
- Multi-step checkout at `/checkout`:
  - Step 1 — Shipping: for guests collect name, email, phone, full address. For logged-in users show address book with option to add new address.
  - Step 2 — Payment: show 3 options — SSL Commerz (card/online banking), bKash, Cash on Delivery. Each shows a description and estimated processing info.
  - Step 3 — Review: show full order summary before placing
- SSL Commerz integration:
  - Server-side: create session using SSLCOMMERZ API, redirect user to payment page
  - Handle success/fail/cancel callbacks at `/api/payment/sslcommerz/callback`
  - Validate IPN (Instant Payment Notification) signature server-side before marking order as PAID
- bKash integration:
  - Use bKash Tokenized Checkout API
  - Server-side token grant → create payment → execute payment flow
  - Handle callback at `/api/payment/bkash/callback`
- Cash on Delivery: no external API needed, mark order as PENDING with paymentStatus UNPAID
- Order confirmation page at `/order/[id]/confirmation` showing order ID, items, total, estimated delivery
- Downloadable invoice (PDF) for each order — generate server-side using `@react-pdf/renderer`

### 👤 User Account

- Registration and login pages at `/(auth)/register` and `/(auth)/login`
- Google OAuth and email+password via NextAuth.js v5
- Password hashing with bcrypt
- Protected account dashboard at `/account`:
  - Order history with status badges and link to order detail
  - Order detail page with item list, tracking status timeline, invoice download
  - Address book: add, edit, delete, set default address
  - Profile settings: update name, email, avatar (uses ImageUploader with folder "avatars")
  - Change password form
- AI-based product recommendations on account dashboard and homepage:
  - Collect browsing history (recently viewed) and purchase history
  - Query similar products using category + brand matching from order history
  - Show as "Recommended for you" section (can be upgraded to a proper recommendation API later)
- Email notifications via Resend for: order placed, order status updates, refund processed

### 📦 Order & Inventory Management (Admin)

- Admin dashboard at `/admin` (protected, ADMIN and STAFF roles only)
- Orders list at `/admin/orders`:
  - Table with columns: order ID, customer, date, total, payment method, status
  - Filter by status, payment method, date range
  - Search by order ID or customer email
- Order detail at `/admin/orders/[id]`:
  - Full item list with images and snapshots of price at time of purchase
  - Customer info and shipping address
  - Update order status dropdown (triggers email notification to customer)
  - Refund button: opens refund form, calls SSL Commerz or bKash refund API, updates paymentStatus to REFUNDED
- Inventory dashboard at `/admin/inventory`:
  - Table of all product variants with current stock
  - Low stock threshold setting per product (default: 5 units)
  - Low stock alert badges on variants below threshold
  - Adjust stock form: add or subtract quantity with a reason field (writes to InventoryLog)
  - Export inventory as CSV
- Return & refund portal: customers can submit a return request from their order detail page. Admin sees all requests at `/admin/returns` and can approve or reject with a note.

### ⭐ Reviews & Social Proof

- Star rating + text review form on product detail page
- Only logged-in users can submit reviews (optionally restrict to verified purchases via a flag)
- Photo upload in review form (up to 5 photos via ImageUploader with folder "reviews")
- Review list: show star breakdown chart, average rating, individual reviews sorted by helpfulness
- Helpful vote button on each review (increment `helpfulCount`)
- Q&A section below reviews: any user can post a question, admin or product owner can post an answer
- Admin can delete inappropriate reviews or answers from `/admin/reviews`

### 📢 Marketing & SEO

- Dynamic meta tags on all pages using Next.js `generateMetadata()`
- OG image for product pages using Next.js `opengraph-image.tsx` route
- Structured data (JSON-LD) on product pages: `Product`, `BreadcrumbList`, `Review` schemas
- Auto-generated sitemap at `/sitemap.ts` covering all product, category, and blog URLs
- `robots.ts` with proper crawl rules
- Blog section at `/blog`:
  - Post listing page with category filter and pagination
  - Post detail page with rich content, author, date, tags
  - Related posts at the bottom
- Blog CMS in admin at `/admin/blog` (CRUD with Tiptap rich text editor and ImageUploader for cover image)

### 📊 Admin Dashboard & Analytics

- KPI cards on dashboard: today's revenue, total orders, new customers today, total products
- Revenue chart (last 30 days) using Recharts BarChart
- Recent orders table (last 10)
- Low stock alerts widget
- Best-selling products (by units sold, last 30 days)
- Sales report at `/admin/analytics`:
  - Date range picker (last 7d, 30d, 90d, custom)
  - Revenue over time chart (line)
  - Orders over time chart
  - Average order value
  - Top products table: name, units sold, revenue
  - Top customers table
  - Export report as CSV
- Product management at `/admin/products`:
  - Searchable, sortable, filterable table of all products
  - Create product form: name, slug (auto-generated from name), description (Tiptap rich text editor), category (select), brand (select), images (ImageUploader with folder "products", up to 10), video (ImageUploader accepting video/*), price, compare-at price, variants section (add rows for size/color/stock/price)
  - Edit product form (pre-filled)
  - Soft delete (archive) with restore option
  - Bulk CSV upload: upload a CSV file, preview parsed rows in a table, validate required fields, import on confirm
- Customer management at `/admin/customers`: list all customers, view individual customer's orders and total spent
- Coupon management at `/admin/coupons`: CRUD for coupons with type (percentage or fixed), value, expiry, usage limit
- Staff management at `/admin/staff`: invite staff by email, assign role (ADMIN | STAFF), revoke access
- Category management at `/admin/categories`: CRUD with parent/child hierarchy and ImageUploader for banner
- Brand management at `/admin/brands`: CRUD with ImageUploader for logo

### 📱 Mobile & UX

- Mobile-first responsive design throughout
- Dark mode: system default + manual toggle using next-themes; toggle button in navbar
- PWA configuration using next-pwa:
  - Offline fallback page
  - `manifest.json` with app name, icons, theme color
  - Service worker caches product listing and recent pages
- Optimised images via `next/image` with proper `sizes` prop and `priority` on above-the-fold images
- Skeleton loaders on all data-fetching pages
- Toast notifications using shadcn Sonner for: add to cart, add to wishlist, coupon applied, errors
- WhatsApp floating button (bottom-right corner) linking to your WhatsApp number with a pre-filled message
- Optional chatbot widget placeholder (add a comment where to integrate Tidio or Crisp later)

### 🌐 Internationalization

- next-intl setup with two locales: `en` (English, default) and `bn` (Bengali)
- Locale files at `/locales/en.json` and `/locales/bn.json`
- Language toggle in the navbar header
- All UI strings must use `useTranslations()` hook or `getTranslations()` server-side — no hardcoded English strings in JSX
- Currency displayed as BDT with ৳ symbol using `Intl.NumberFormat`

### 🔐 Legal & Trust Pages

Create simple, well-formatted static pages for:
- `/privacy-policy`
- `/terms-of-service`
- `/return-policy`
- `/faq` — accordion using shadcn Accordion component
- GDPR cookie consent banner (bottom bar, appears on first visit, stores acceptance in localStorage)

---

## Folder Structure

Enforce this structure throughout the project:

```
/app
  /(store)            → public storefront layout and pages
    /page.tsx         → homepage
    /products/        → listing and detail pages
    /cart/
    /checkout/
    /wishlist/
    /compare/
    /search/
    /blog/
    /account/         → protected user dashboard
    /order/
  /(auth)             → login and register pages (no navbar)
  /admin              → admin dashboard (protected, role check in layout)
  /api                → all API route handlers
    /auth/
    /upload/          → Supabase Storage upload endpoint
    /payment/
    /webhooks/
/components
  /ui/                → shadcn auto-generated components (do not edit manually)
  /shared/            → reusable app-level components
    /image-uploader.tsx
    /product-card.tsx
    /star-rating.tsx
    /breadcrumb.tsx
    /navbar.tsx
    /footer.tsx
    /cookie-banner.tsx
  /admin/             → admin-only components
/lib
  /db.ts              → Prisma client singleton
  /auth.ts            → NextAuth.js v5 config
  /env.ts             → zod env validation
  /supabase.ts        → Supabase browser and admin clients
  /storage.ts         → upload, delete, getPublicUrl helpers
  /utils.ts           → cn(), formatPrice(), generateSlug() etc.
  /email.ts           → Resend email sending helpers
/hooks
  /use-cart.ts
  /use-wishlist.ts
  /use-recently-viewed.ts
  /use-debounce.ts
/stores
  /cart-store.ts      → Zustand cart store
  /wishlist-store.ts
/types
  /index.ts           → global TypeScript types and interfaces
/locales
  /en.json
  /bn.json
/prisma
  /schema.prisma
  /seed.ts            → seed script with sample categories, brands, products
/public
  /icons/             → PWA icons
  /images/            → static assets (logo, placeholder images)
```

---

## How To Work With Me

1. When I say **"start phase X"**, begin only that phase. Do not generate other phases unless I ask.
2. Always show me the **complete file** — never truncate with `// ... rest of code` or similar.
3. After creating each file, tell me any **terminal commands** I need to run (npm install, prisma migrate, etc.) and any **shadcn components** to add: `npx shadcn@latest add [component]`.
4. If you make an assumption, **state it clearly** before the code.
5. If there are multiple valid approaches, **briefly list them**, recommend one, and explain why.
6. End every response with: **"Next step: [what to do next]"**

---

## Build Phases

### Phase 1 — Foundation
1. Initialize Next.js 14 with TypeScript, Tailwind, App Router
2. Install and configure shadcn/ui
3. Create `/lib/env.ts` with zod validation for all env vars
4. Create `.env.example`
5. Create full Prisma schema with all models listed above
6. Create `/lib/db.ts` Prisma singleton
7. Configure NextAuth.js v5 with Prisma adapter, email+password, and Google OAuth
8. Create login and register pages using shadcn form components
9. Create `middleware.ts` for route protection (`/account/*`, `/admin/*`)
10. Create root layout with next-themes dark mode provider
11. Create navbar: logo, search bar, cart icon with item count badge, wishlist icon, user menu dropdown, dark mode toggle, language switcher
12. Create footer with navigation links and newsletter signup input
13. Create Zustand cart store (`/stores/cart-store.ts`) and wishlist store
14. Create `/lib/supabase.ts` with browser and admin clients
15. Create `/lib/storage.ts` upload/delete helpers
16. Create `POST /api/upload/route.ts` Supabase Storage upload endpoint
17. Create `/components/shared/image-uploader.tsx` reusable drag-and-drop upload component

### Phase 2 — Core Shopping
1. Homepage with featured products, categories, hero banner, recommendations
2. Product listing page with filters, pagination, ProductCard
3. Product search (debounced, instant dropdown, full search results page)
4. Product detail page (gallery with zoom, video, variants, add to cart, reviews tab, Q&A tab)
5. Cart page with coupon input, gift wrapping, order summary
6. Multi-step checkout: shipping → payment → review
7. SSL Commerz integration (sandbox)
8. bKash integration (sandbox)
9. Cash on Delivery flow
10. Order confirmation page + PDF invoice
11. Wishlist page
12. Product comparison page
13. Review form with photo upload
14. Q&A section
15. Recently viewed products

### Phase 3 — User Account
1. Account dashboard layout and navigation
2. Order history and order detail with tracking timeline
3. Address book management
4. Profile settings with avatar upload
5. Change password
6. AI product recommendations section (category/brand-based matching)
7. Email notifications via Resend (order placed, status update, refund)

### Phase 4 — Admin Dashboard
1. Admin layout with sidebar, role-based nav, breadcrumb
2. Dashboard KPIs, revenue chart, recent orders, low stock alerts
3. Product management: list, create, edit, archive, bulk CSV upload
4. Order management: list, detail, status update, refund processing
5. Inventory dashboard with stock adjustment and InventoryLog
6. Return & refund portal
7. Customer management
8. Coupon management
9. Staff role management
10. Category and brand management with image upload
11. Blog CMS with Tiptap and image upload
12. Analytics: sales report, top products, export CSV

### Phase 5 — SEO, PWA & Polish
1. `generateMetadata()` on all pages
2. OG images for product and blog pages
3. JSON-LD structured data on product pages
4. `/sitemap.ts` auto-generated from DB
5. `/robots.ts`
6. PWA: next-pwa config, manifest.json, offline page
7. next-intl complete setup for English and Bengali
8. GDPR cookie consent banner
9. Legal pages: privacy policy, terms, return policy, FAQ
10. WhatsApp floating chat button
11. Performance audit: check `next/image` usage, font optimization, Lighthouse score
12. Write final `README.md` covering setup, env vars, Supabase setup, Vercel deployment, and database seeding
