"use client";

import { useState } from "react";

type InventoryAdjustFormProps = {
  variantId: string;
};

export const InventoryAdjustForm = ({ variantId }: InventoryAdjustFormProps) => {
  const [change, setChange] = useState("0");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const submit = async () => {
    setError("");
    setMessage("");
    const response = await fetch("/api/admin/inventory/adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId, change: Number(change), reason }),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(payload.error ?? "Failed to adjust stock.");
      return;
    }
    setMessage("Stock updated.");
    setChange("0");
    setReason("");
    window.location.reload();
  };

  return (
    <div className="mt-3 space-y-2 text-xs">
      <div className="grid gap-2 sm:grid-cols-[100px_1fr_auto]">
        <input
          type="number"
          value={change}
          onChange={(event) => setChange(event.target.value)}
          className="rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <input
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Reason"
          className="rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="button"
          onClick={submit}
          className="rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700"
        >
          Adjust
        </button>
      </div>
      {error ? <p className="text-red-600">{error}</p> : null}
      {message ? <p className="text-emerald-600">{message}</p> : null}
    </div>
  );
};
