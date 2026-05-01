"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "nur-recently-viewed";
const MAX_ITEMS = 12;

export const useRecentlyViewed = () => {
  const [productIds, setProductIds] = useState<string[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as string[];
      setProductIds(Array.isArray(parsed) ? parsed : []);
    } catch {
      setProductIds([]);
    }
  }, []);

  const addProduct = (productId: string) => {
    setProductIds((prev) => {
      const next = [productId, ...prev.filter((id) => id !== productId)].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const clear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProductIds([]);
  };

  return { productIds, addProduct, clear };
};
