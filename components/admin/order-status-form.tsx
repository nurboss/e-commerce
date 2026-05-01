"use client";

import { OrderStatus } from "@prisma/client";
import { useState } from "react";

type OrderStatusFormProps = {
  orderId: string;
  currentStatus: OrderStatus;
};

export const OrderStatusForm = ({ orderId, currentStatus }: OrderStatusFormProps) => {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const saveStatus = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Failed to update status.");
        return;
      }
      setMessage("Order status updated.");
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const processRefund = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refund: true }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Failed to process refund.");
        return;
      }
      setMessage("Refund processed and order marked as REFUNDED.");
      setStatus(OrderStatus.REFUNDED);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-zinc-200 p-4 text-sm dark:border-zinc-800">
      <h2 className="font-semibold">Order actions</h2>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as OrderStatus)}
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        >
          {Object.values(OrderStatus).map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={loading}
          onClick={saveStatus}
          className="rounded-md bg-zinc-900 px-4 py-2 text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Update status
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={processRefund}
          className="rounded-md border border-red-300 px-4 py-2 text-red-600 disabled:opacity-60"
        >
          Mark refunded
        </button>
      </div>
      {message ? <p className="text-emerald-600">{message}</p> : null}
      {error ? <p className="text-red-600">{error}</p> : null}
    </div>
  );
};
