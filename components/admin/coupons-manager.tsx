"use client";

import { DiscountType } from "@prisma/client";
import { useState } from "react";

type CouponRow = {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
};

type CouponsManagerProps = {
  coupons: CouponRow[];
};

export const CouponsManager = ({ coupons }: CouponsManagerProps) => {
  const [rows, setRows] = useState(coupons);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>(DiscountType.PERCENTAGE);
  const [discountValue, setDiscountValue] = useState(0);
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");

  const reset = () => {
    setEditingId(null);
    setCode("");
    setDiscountType(DiscountType.PERCENTAGE);
    setDiscountValue(0);
    setMinOrderAmount("");
    setMaxUses("");
    setExpiresAt("");
    setIsActive(true);
  };

  const startEdit = (row: CouponRow) => {
    setEditingId(row.id);
    setCode(row.code);
    setDiscountType(row.discountType);
    setDiscountValue(row.discountValue);
    setMinOrderAmount(row.minOrderAmount ? String(row.minOrderAmount) : "");
    setMaxUses(row.maxUses ? String(row.maxUses) : "");
    setExpiresAt(row.expiresAt ? row.expiresAt.slice(0, 16) : "");
    setIsActive(row.isActive);
  };

  const save = async () => {
    const payload = {
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : null,
      maxUses: maxUses ? Number(maxUses) : null,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      isActive,
    };
    const endpoint = editingId ? `/api/admin/coupons/${editingId}` : "/api/admin/coupons";
    const response = await fetch(endpoint, {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      setError("Failed to save coupon.");
      return;
    }
    window.location.reload();
  };

  const remove = async (id: string) => {
    const response = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Failed to delete coupon.");
      return;
    }
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  return (
    <div className="space-y-6">
      <section className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="font-semibold">{editingId ? "Edit coupon" : "Create coupon"}</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Code"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <select
            value={discountType}
            onChange={(event) => setDiscountType(event.target.value as DiscountType)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value={DiscountType.PERCENTAGE}>PERCENTAGE</option>
            <option value={DiscountType.FIXED}>FIXED</option>
          </select>
          <input
            type="number"
            min={0}
            step={0.01}
            value={discountValue}
            onChange={(event) => setDiscountValue(Number(event.target.value))}
            placeholder="Discount value"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <input
            type="number"
            min={0}
            step={0.01}
            value={minOrderAmount}
            onChange={(event) => setMinOrderAmount(event.target.value)}
            placeholder="Min order amount"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <input
            type="number"
            min={1}
            value={maxUses}
            onChange={(event) => setMaxUses(event.target.value)}
            placeholder="Max uses"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(event) => setExpiresAt(event.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
          />
          Active
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={save}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            {editingId ? "Update coupon" : "Create coupon"}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={reset}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
            >
              Cancel
            </button>
          ) : null}
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </section>

      <section className="space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
            <div>
              <p className="font-medium">{row.code}</p>
              <p className="text-zinc-500">
                {row.discountType} {row.discountValue} | used {row.usedCount}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => startEdit(row)}
                className="rounded-md border border-zinc-300 px-3 py-1.5 dark:border-zinc-700"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => remove(row.id)}
                className="rounded-md border border-red-300 px-3 py-1.5 text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};
