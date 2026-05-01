"use client";

import { BlogStatus } from "@prisma/client";
import { useState } from "react";
import { ImageUploader } from "@/components/shared/image-uploader";
import { generateSlug } from "@/lib/utils";

type BlogRow = {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  body: string;
  tags: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  status: BlogStatus;
};

type BlogManagerProps = {
  posts: BlogRow[];
};

export const BlogManager = ({ posts }: BlogManagerProps) => {
  const [rows, setRows] = useState(posts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [status, setStatus] = useState<BlogStatus>(BlogStatus.DRAFT);
  const [error, setError] = useState("");

  const reset = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setCoverImage("");
    setBody("");
    setTags("");
    setMetaTitle("");
    setMetaDescription("");
    setStatus(BlogStatus.DRAFT);
  };

  const startEdit = (row: BlogRow) => {
    setEditingId(row.id);
    setTitle(row.title);
    setSlug(row.slug);
    setCoverImage(row.coverImage ?? "");
    setBody(row.body);
    setTags(row.tags.join(", "));
    setMetaTitle(row.metaTitle ?? "");
    setMetaDescription(row.metaDescription ?? "");
    setStatus(row.status);
  };

  const save = async () => {
    const payload = {
      title,
      slug: slug || generateSlug(title),
      coverImage: coverImage || null,
      body,
      tags: tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      status,
    };
    const endpoint = editingId ? `/api/admin/blog/${editingId}` : "/api/admin/blog";
    const response = await fetch(endpoint, {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      setError("Failed to save blog post.");
      return;
    }
    window.location.reload();
  };

  const remove = async (id: string) => {
    const response = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Failed to delete blog post.");
      return;
    }
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  return (
    <div className="space-y-6">
      <section className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="font-semibold">{editingId ? "Edit post" : "Create post"}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Title"
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
          folder="blog"
          multiple={false}
          maxFiles={1}
          onUpload={(urls) => setCoverImage(urls[0] ?? "")}
          existingUrls={coverImage ? [coverImage] : []}
        />
        <textarea
          rows={6}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Body HTML"
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="Tags (comma separated)"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <input
            value={metaTitle}
            onChange={(event) => setMetaTitle(event.target.value)}
            placeholder="Meta title"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as BlogStatus)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value={BlogStatus.DRAFT}>DRAFT</option>
            <option value={BlogStatus.PUBLISHED}>PUBLISHED</option>
          </select>
        </div>
        <textarea
          rows={2}
          value={metaDescription}
          onChange={(event) => setMetaDescription(event.target.value)}
          placeholder="Meta description"
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={save}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            {editingId ? "Update post" : "Create post"}
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
          <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
            <div>
              <p className="font-medium">{row.title}</p>
              <p className="text-zinc-500">
                {row.slug} | {row.status}
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
