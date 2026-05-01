import { BlogManager } from "@/components/admin/blog-manager";
import { db } from "@/lib/db";

export default async function AdminBlogPage() {
  const posts = await db.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      coverImage: true,
      body: true,
      tags: true,
      metaTitle: true,
      metaDescription: true,
      status: true,
    },
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Blog CMS</h1>
        <p className="text-sm text-zinc-500">Create and manage blog posts with publish status.</p>
      </div>
      <BlogManager posts={posts} />
    </section>
  );
}
