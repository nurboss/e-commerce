import { BlogStatus } from "@prisma/client";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

type BlogDetailPageProps = {
  params: { slug: string };
};

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const post = await db.blogPost.findFirst({
    where: { slug: params.slug, status: BlogStatus.PUBLISHED },
    include: { author: true },
  });
  if (!post) {
    notFound();
  }

  const relatedPosts = await db.blogPost.findMany({
    where: {
      status: BlogStatus.PUBLISHED,
      id: { not: post.id },
      OR: [{ tags: { hasSome: post.tags } }],
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  return (
    <article className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">{post.title}</h1>
        <p className="text-sm text-zinc-500">
          {post.author.name ?? post.author.email} |{" "}
          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "Unpublished"}
        </p>
      </header>
      <section
        className="prose prose-zinc max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: post.body }}
      />
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Related posts</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {relatedPosts.map((relatedPost) => (
            <a
              key={relatedPost.id}
              href={`/blog/${relatedPost.slug}`}
              className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800"
            >
              <p className="font-medium">{relatedPost.title}</p>
            </a>
          ))}
        </div>
      </section>
    </article>
  );
}
