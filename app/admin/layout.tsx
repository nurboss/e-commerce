import Link from "next/link";

type AdminLayoutProps = {
  children: React.ReactNode;
};

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/brands", label: "Brands" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/staff", label: "Staff" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/analytics", label: "Analytics" },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
      <aside className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <p className="text-sm font-semibold">Admin Panel</p>
        <nav className="mt-3 flex flex-col gap-2 text-sm">
          {adminLinks.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-md px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-900">
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
