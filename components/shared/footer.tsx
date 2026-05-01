import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="border-t border-zinc-200 py-8 dark:border-zinc-800">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm text-zinc-500">
        <p>© {new Date().getFullYear()} NUR Store</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms-of-service">Terms of Service</Link>
          <Link href="/return-policy">Return Policy</Link>
          <Link href="/faq">FAQ</Link>
        </div>
        <div className="max-w-md">
          <label className="mb-2 block">Newsletter</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
      </div>
    </footer>
  );
};
