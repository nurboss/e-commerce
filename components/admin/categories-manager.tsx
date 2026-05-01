"use client";

import { useMemo, useState } from "react";
import { ImageUploader } from "@/components/shared/image-uploader";
import { generateSlug } from "@/lib/utils";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  parentId: string | null;
};

type CategoriesManagerProps = {
  categories: CategoryRow[];
};

export const CategoriesManager = ({ categories }: CategoriesManagerProps) => {
  const [rows, setRows] = useState(categories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [image, setImage] = useState("");
  const [parentId, setParentId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setImage("");
    setParentId("");
  };

  const parentOptions = useMemo(
    () => rows.filter((row) => row.id !== editingId),
    [rows, editingId],
  );

  const startEdit = (row: CategoryRow) => {
    setEditingId(row.id);
    setName(row.name);
    setSlug(row.slug);
    setImage(row.image ?? "");
    setParentId(row.parentId ?? "");
    setMessage("");
    setError("");
  };

  const submit = async () => {
    setError("");
    setMessage("");
    const payload = {
      name,
      slug: slug || generateSlug(name),
      image: image || null,
      parentId: parentId || null,
    };
    const endpoint = editingId ? `/api/admin/categories/${editingId}` : "/api/admin/categories";
    const method = editingId ? "PATCH" : "POST";
    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = (await response.json()) as { id?: string; error?: string };
    if (!response.ok || !body.id) {
      setError(body.error ?? "Failed to save category.");
      return;
    }
    window.location.reload();
  };

  const remove = async (id: string) => {
    const response = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Failed to delete category.");
      return;
    }
    setRows((prev) => prev.filter((row) => row.id !== id));
    setMessage("Category deleted.");
    if (editingId === id) resetForm();
  };

  return (
    <div className="space-y-6">
      <section className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="font-semibold">{editingId ? "Edit category" : "Create category"}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Category name"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <input
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="Slug (optional)"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <select
            value={parentId}
            onChange={(event) => setParentId(event.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">No parent category</option>
            {parentOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        <ImageUploader
          folder="categories"
          multiple={false}
          maxFiles={1}
          onUpload={(urls) => setImage(urls[0] ?? "")}
          existingUrls={image ? [image] : []}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={submit}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            {editingId ? "Update category" : "Create category"}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
            >
              Cancel edit
            </button>
          ) : null}
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      </section>

      <section className="space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
            <div>
              <p className="font-medium">{row.name}</p>
              <p className="text-zinc-500">
                {row.slug}
                {row.parentId ? ` | child category` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => startEdit(row)}
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
