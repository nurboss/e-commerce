"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";

type Folder = "products" | "reviews" | "blog" | "avatars" | "categories" | "brands";

interface ImageUploaderProps {
  folder: Folder;
  multiple?: boolean;
  maxFiles?: number;
  accept?: string;
  onUpload: (urls: string[]) => void;
  existingUrls?: string[];
}

type UploadItem = {
  url: string;
  path: string;
  progress: number;
};

export const ImageUploader = ({
  folder,
  multiple = false,
  maxFiles = 1,
  accept = "image/*",
  onUpload,
  existingUrls = [],
}: ImageUploaderProps) => {
  const [items, setItems] = useState<UploadItem[]>(
    existingUrls.map((url) => ({ url, path: "", progress: 100 })),
  );
  const [error, setError] = useState("");

  useEffect(() => {
    onUpload(items.map((item) => item.url));
  }, [items, onUpload]);

  const acceptConfig = useMemo(() => ({ [accept]: [] }), [accept]);

  const onDrop = async (files: File[]) => {
    setError("");
    if (files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed.`);
      return;
    }

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as { url?: string; path?: string; error?: string };
      if (!response.ok || !payload.url || !payload.path) {
        setError(payload.error ?? "Upload failed.");
        continue;
      }
      setItems((prev) => [
        ...prev.slice(0, multiple ? maxFiles : 0),
        { url: payload.url!, path: payload.path!, progress: 100 },
      ]);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: acceptConfig,
    onDrop,
    multiple,
    maxFiles,
  });

  const removeItem = async (item: UploadItem) => {
    if (item.path) {
      await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: item.path }),
      });
    }
    setItems((prev) => prev.filter((it) => it.url !== item.url));
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className="cursor-pointer rounded-lg border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700"
      >
        <input {...getInputProps()} />
        <p>Drag and drop files here, or click to browse.</p>
      </div>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {items.map((item) => (
          <div key={item.url} className="relative overflow-hidden rounded-md border p-2">
            <Image
              src={item.url}
              alt="Upload"
              width={300}
              height={300}
              className="h-28 w-full rounded object-cover"
            />
            <button
              type="button"
              className="mt-2 w-full rounded bg-red-600 px-2 py-1 text-xs text-white"
              onClick={() => removeItem(item)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
