"use client";

import { useMemo, useState } from "react";
import { ImageUploader } from "@/components/shared/image-uploader";
import { generateSlug } from "@/lib/utils";

type Option = { id: string; name: string };

type VariantInput = {
  id?: string;
  size: string;
  color: string;
  price: string;
  stock: string;
};

type ProductFormProps = {
  categories: Option[];
  brands: Option[];
  initial?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    images: string[];
    videoUrl: string | null;
    price: number;
    compareAtPrice: number | null;
    categoryId: string;
    brandId: string;
    isFeatured: boolean;
    isArchived: boolean;
    variants: Array<{
      id: string;
      size: string | null;
      color: string | null;
      price: number | null;
      stock: number;
    }>;
  };
};

export const ProductForm = ({ categories, brands, initial }: ProductFormProps) => {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [compareAtPrice, setCompareAtPrice] = useState(initial?.compareAtPrice ? String(initial.compareAtPrice) : "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [brandId, setBrandId] = useState(initial?.brandId ?? brands[0]?.id ?? "");
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [isArchived, setIsArchived] = useState(initial?.isArchived ?? false);
  const [variants, setVariants] = useState<VariantInput[]>(
    initial?.variants.map((variant) => ({
      id: variant.id,
      size: variant.size ?? "",
      color: variant.color ?? "",
      price: variant.price ? String(variant.price) : "",
      stock: String(variant.stock),
    })) ?? [{ size: "", color: "", price: "", stock: "0" }],
  );
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const title = useMemo(() => (initial ? "Edit Product" : "Create Product"), [initial]);

  const setVariant = (index: number, key: keyof VariantInput, value: string) => {
    setVariants((prev) =>
      prev.map((variant, i) => (i === index ? { ...variant, [key]: value } : variant)),
    );
  };

  const addVariant = () => {
    setVariants((prev) => [...prev, { size: "", color: "", price: "", stock: "0" }]);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = async () => {
    setError("");
    setMessage("");
    const payload = {
      name,
      slug: slug || generateSlug(name),
      description,
      images,
      videoUrl: videoUrl || null,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      categoryId,
      brandId,
      isFeatured,
      isArchived,
      variants: variants.map((variant) => ({
        id: variant.id,
        size: variant.size || undefined,
        color: variant.color || undefined,
        price: variant.price ? Number(variant.price) : null,
        stock: Number(variant.stock || "0"),
      })),
    };

    const endpoint = initial ? `/api/admin/products/${initial.id}` : "/api/admin/products";
    const response = await fetch(endpoint, {
      method: initial ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = (await response.json()) as { id?: string; error?: string };
    if (!response.ok || !body.id) {
      setError(body.error ?? "Failed to save product.");
      return;
    }
    setMessage("Product saved successfully.");
    if (!initial) {
      window.location.href = `/admin/products/${body.id}/edit`;
    }
  };

  return (
    <section className="space-y-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Product name"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <input
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          placeholder="Slug (optional)"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Description"
        rows={4}
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
      <ImageUploader
        folder="products"
        multiple
        maxFiles={10}
        onUpload={setImages}
        existingUrls={images}
      />
      <input
        value={videoUrl}
        onChange={(event) => setVideoUrl(event.target.value)}
        placeholder="Video URL (optional)"
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          type="number"
          min={0}
          step={0.01}
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          placeholder="Price"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <input
          type="number"
          min={0}
          step={0.01}
          value={compareAtPrice}
          onChange={(event) => setCompareAtPrice(event.target.value)}
          placeholder="Compare at price"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <select
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          {categories.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        <select
          value={brandId}
          onChange={(event) => setBrandId(event.target.value)}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          {brands.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(event) => setIsFeatured(event.target.checked)}
          />
          Featured
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isArchived}
            onChange={(event) => setIsArchived(event.target.checked)}
          />
          Archived
        </label>
      </div>

      <div className="space-y-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
        <p className="font-medium">Variants</p>
        {variants.map((variant, index) => (
          <div key={variant.id ?? `new-${index}`} className="grid gap-2 sm:grid-cols-4">
            <input
              value={variant.size}
              onChange={(event) => setVariant(index, "size", event.target.value)}
              placeholder="Size"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              value={variant.color}
              onChange={(event) => setVariant(index, "color", event.target.value)}
              placeholder="Color"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              type="number"
              value={variant.price}
              onChange={(event) => setVariant(index, "price", event.target.value)}
              placeholder="Price override"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                value={variant.stock}
                onChange={(event) => setVariant(index, "stock", event.target.value)}
                placeholder="Stock"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
              <button
                type="button"
                onClick={() => removeVariant(index)}
                className="rounded-md border border-red-300 px-3 text-xs text-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addVariant}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs dark:border-zinc-700"
        >
          Add variant
        </button>
      </div>

      <button
        type="button"
        onClick={submit}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        Save product
      </button>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
    </section>
  );
};
