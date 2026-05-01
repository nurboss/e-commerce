"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const MAX_COMPARE_PRODUCTS = 4;

type CompareState = {
  productIds: string[];
  toggleProduct: (productId: string) => void;
  removeProduct: (productId: string) => void;
  clear: () => void;
};

export const useCompareStore = create<CompareState>()(
  persist(
    (set) => ({
      productIds: [],
      toggleProduct: (productId) =>
        set((state) => {
          const exists = state.productIds.includes(productId);
          if (exists) {
            return { productIds: state.productIds.filter((id) => id !== productId) };
          }
          if (state.productIds.length >= MAX_COMPARE_PRODUCTS) {
            return { productIds: [...state.productIds.slice(1), productId] };
          }
          return { productIds: [...state.productIds, productId] };
        }),
      removeProduct: (productId) =>
        set((state) => ({
          productIds: state.productIds.filter((id) => id !== productId),
        })),
      clear: () => set({ productIds: [] }),
    }),
    {
      name: "nur-compare",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
