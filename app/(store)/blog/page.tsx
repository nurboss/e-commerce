import Link from "next/link";
import { BlogStatus } from "@prisma/client";
import { db } from "@/lib/db";

type BlogPageProps = {
  searchParams: { page?: string };
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const page = Math.max(Number(searchParams.page ?? "1") || 1, 1);
  const pageSize = 6;
  const [posts, total] = await Promise.all([
    db.blogPost.findMany({
      where: { status: BlogStatus.PUBLISHED },
      include: { author: true },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.blogPost.count({ where: { status: BlogStatus.PUBLISHED } }),
  ]);
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">Blog</h1>
        <p className="text-sm text-zinc-500">Guides, announcements, and shopping tips.</p>
      </div>
      {posts.length === 0 ? (
        <p className="rounded-lg border border-zinc-200 p-4 text-sm text-zinc-500 dark:border-zinc-800">
          No published posts yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <p className="text-xs text-zinc-500">
                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "Draft"} |{" "}
                {post.author.name ?? post.author.email}
              </p>
              <h2 className="mt-2 font-semibold">{post.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-zinc-500">{post.metaDescription ?? post.body}</p>
              <Link href={`/blog/${post.slug}`} className="mt-3 inline-block text-xs underline">
                Read post
              </Link>
            </article>
          ))}
        </div>
      )}
      <div className="flex justify-end gap-2 text-sm">
        <Link
          href={`/blog?page=${Math.max(1, page - 1)}`}
          className="rounded-md border border-zinc-300 px-3 py-1.5 dark:border-zinc-700"
        >
          Previous
        </Link>
        <span className="px-1 py-1.5 text-zinc-500">
          Page {page} of {totalPages}
        </span>
        <Link
          href={`/blog?page=${Math.min(totalPages, page + 1)}`}
          className="rounded-md border border-zinc-300 px-3 py-1.5 dark:border-zinc-700"
        >
          Next
        </Link>
      </div>
    </section>
  );
}
