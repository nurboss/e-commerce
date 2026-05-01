import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteFile, getPublicUrl } from "@/lib/storage";
import { supabaseAdmin } from "@/lib/supabase";

const limits: Record<string, number> = {
  products: 20 * 1024 * 1024,
  reviews: 5 * 1024 * 1024,
  blog: 5 * 1024 * 1024,
  avatars: 2 * 1024 * 1024,
  categories: 5 * 1024 * 1024,
  brands: 2 * 1024 * 1024,
};

const protectedFolders = ["products", "blog", "avatars", "categories", "brands"];
const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
]);

export async function POST(request: Request) {
  const session = await auth();
  const formData = await request.formData();
  const file = formData.get("file");
  const folder = String(formData.get("folder") ?? "");

  if (!(file instanceof File) || !(folder in limits)) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }
  if (protectedFolders.includes(folder) && !session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!allowedTypes.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  }
  if (file.size > limits[folder]) {
    return NextResponse.json({ error: "File exceeds size limit." }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${folder}/${Date.now()}-${randomUUID()}.${ext}`;
  const { error } = await supabaseAdmin.storage
    .from("ecommerce")
    .upload(path, file, { contentType: file.type });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ url: getPublicUrl(path), path });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as { path?: string };
  if (!body.path) {
    return NextResponse.json({ error: "Path is required." }, { status: 400 });
  }

  await deleteFile(body.path);
  return NextResponse.json({ ok: true });
}
