import { NextResponse } from "next/server";
import { z } from "zod";
import { getProductsByIds } from "@/lib/catalog";

const schema = z.object({
  ids: z.array(z.string().min(1)).max(100),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }
    const items = await getProductsByIds(parsed.data.ids);
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load products.", detail: String(error) },
      { status: 500 },
    );
  }
}
