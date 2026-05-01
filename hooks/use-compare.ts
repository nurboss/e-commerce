"use client";

import { useCompareStore } from "@/stores/compare-store";

export const useCompare = () => {
  const productIds = useCompareStore((state) => state.productIds);
  const toggleProduct = useCompareStore((state) => state.toggleProduct);
  const removeProduct = useCompareStore((state) => state.removeProduct);
  const clear = useCompareStore((state) => state.clear);

  return {
    productIds,
    toggleProduct,
    removeProduct,
    clear,
  };
};
