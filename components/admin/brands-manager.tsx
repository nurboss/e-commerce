"use client";

import { useState } from "react";
import { ImageUploader } from "@/components/shared/image-uploader";
import { generateSlug } from "@/lib/utils";

type BrandRow = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
};

type BrandsManagerProps = {
  brands: BrandRow[];
};

export const BrandsManager = ({ brands }: BrandsManagerProps) => {
  const [rows, setRows] = useState(brands);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logo, setLogo] = useState("");
  const [error, setError] = useState("");

  const beginEdit = (brand: BrandRow) => {
    setEditingId(brand.id);
    setName(brand.name);
    setSlug(brand.slug);
    setLogo(brand.logo ?? "");
  };

  const reset = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setLogo("");
  };

  const submit = async () => {
    setError("");
    const endpoint = editingId ? `/api/admin/brands/${editingId}` : "/api/admin/brands";
    const response = await fetch(endpoint, {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug: slug || generateSlug(name), logo: logo || null }),
    });
    if (!response.ok) {
      setError("Failed to save brand.");
      return;
    }
    window.location.reload();
  };

  const remove = async (id: string) => {
    const response = await fetch(`/api/admin/brands/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Failed to delete brand.");
      return;
    }
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  return (
    <div className="space-y-6">
      <section className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="font-semibold">{editingId ? "Edit brand" : "Create brand"}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Brand name"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <input
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="Slug (optional)"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <ImageUploader
          folder="brands"
          multiple={false}
          maxFiles={1}
          onUpload={(urls) => setLogo(urls[0] ?? "")}
          existingUrls={logo ? [logo] : []}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={submit}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            {editingId ? "Update brand" : "Create brand"}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={reset}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
            >
              Cancel
            </button>
          ) : null}
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </section>
      <section className="space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
            <div>
              <p className="font-medium">{row.name}</p>
              <p className="text-zinc-500">{row.slug}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => beginEdit(row)}
                className="rounded-md border border-zinc-300 px-3 py-1.5 dark:border-zinc-700"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => remove(row.id)}
                className="rounded-md border border-red-300 px-3 py-1.5 text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};
