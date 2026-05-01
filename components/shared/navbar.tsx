"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useCart } from "@/hooks/use-cart";
import { useDebounce } from "@/hooks/use-debounce";
import { useCompare } from "@/hooks/use-compare";
import { useWishlist } from "@/hooks/use-wishlist";
import { formatPrice } from "@/lib/utils";
import { useEffect, useState } from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";

type SearchResult = {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
};

export const Navbar = () => {
  // const { setTheme, resolvedTheme } = useTheme();
  const { items } = useCart();
  const { productIds } = useWishlist();
  const { productIds: compareIds } = useCompare();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const debouncedQuery = useDebounce(query, 300);

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const runSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }
      const response = await fetch(
        `/api/products/search?q=${encodeURIComponent(debouncedQuery)}`,
      );
      if (!response.ok) {
        setResults([]);
        return;
      }
      const payload = (await response.json()) as { items?: SearchResult[] };
      setResults(payload.items ?? []);
    };

    void runSearch();
  }, [debouncedQuery]);

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex flex-col gap-3 px-4 py-3 md:h-16 md:max-w-7xl md:flex-row md:items-center md:justify-between md:py-0">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-lg font-semibold">
            NUR Store
          </Link>
          <ThemeSwitcher />
          {/* <button
            type="button"
            className="rounded-md border border-zinc-300 px-3 py-1 text-xs dark:border-zinc-700 md:hidden"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            {resolvedTheme === "dark" ? "Light" : "Dark"}
          </button> */}
        </div>

        <div className="flex-1 md:max-w-lg">
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            {results.length > 0 ? (
              <div className="absolute left-0 right-0 top-11 z-30 rounded-lg border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
                {results.map((result) => (
                  <Link
                    key={result.id}
                    href={`/products/${result.slug}`}
                    className="flex items-center gap-3 rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    onClick={() => {
                      setQuery("");
                      setResults([]);
                    }}
                  >
                    <Image
                      src={result.image}
                      alt={result.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-md object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{result.name}</p>
                      <p className="text-xs text-zinc-500">
                        {formatPrice(result.price)}
                      </p>
                    </div>
                  </Link>
                ))}
                <Link
                  href={`/search?q=${encodeURIComponent(debouncedQuery)}`}
                  className="mt-1 block rounded-md p-2 text-center text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  onClick={() => {
                    setQuery("");
                    setResults([]);
                  }}
                >
                  View all results
                </Link>
              </div>
            ) : null}
          </div>
        </div>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/products">Products</Link>
          <Link href="/wishlist">Wishlist ({productIds.length})</Link>
          <Link href="/compare">Compare ({compareIds.length})</Link>
          <Link href="/cart">Cart ({cartCount})</Link>
          <Link href="/account">Account</Link>
          <Link href="/login">Login</Link>
          <ThemeSwitcher />
          {/* <button
            type="button"
            className="hidden rounded-md border border-zinc-300 px-3 py-1 dark:border-zinc-700 md:inline-flex"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            {resolvedTheme === "dark" ? "Light" : "Dark"}
          </button> */}
          <button
            type="button"
            className="rounded-md border border-zinc-300 px-3 py-1 dark:border-zinc-700"
          >
            EN | BN
          </button>
        </nav>
      </div>
      {compareIds.length >= 2 ? (
        <div className="border-t border-zinc-200 px-4 py-2 text-center text-xs dark:border-zinc-800">
          <Link href="/compare" className="font-medium underline">
            {compareIds.length} products selected for comparison
          </Link>
        </div>
      ) : null}
    </header>
  );
};
