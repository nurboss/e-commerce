import { NextResponse } from "next/server";
import { getInstantSearchProducts } from "@/lib/catalog";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";

  try {
    const items = await getInstantSearchProducts(q);
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to search products.", detail: String(error) },
      { status: 500 },
    );
  }
}
