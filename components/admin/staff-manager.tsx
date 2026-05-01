"use client";

import { UserRole } from "@prisma/client";
import { useState } from "react";

type StaffRow = {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
};

type StaffManagerProps = {
  staffUsers: StaffRow[];
};

export const StaffManager = ({ staffUsers }: StaffManagerProps) => {
  const [rows, setRows] = useState(staffUsers);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.STAFF);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const invite = async () => {
    setError("");
    setMessage("");
    const response = await fetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(payload.error ?? "Failed to assign staff role.");
      return;
    }
    setMessage("Role assigned successfully.");
    window.location.reload();
  };

  const revoke = async (id: string) => {
    setError("");
    const response = await fetch(`/api/admin/staff/${id}`, { method: "DELETE" });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(payload.error ?? "Failed to revoke staff role.");
      return;
    }
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  return (
    <div className="space-y-6">
      <section className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="font-semibold">Assign staff role</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="User email"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value={UserRole.STAFF}>STAFF</option>
            <option value={UserRole.ADMIN}>ADMIN</option>
          </select>
          <button
            type="button"
            onClick={invite}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Assign role
          </button>
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      </section>

      <section className="space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
            <div>
              <p className="font-medium">{row.name ?? "Unnamed user"}</p>
              <p className="text-zinc-500">
                {row.email ?? "No email"} | {row.role}
              </p>
            </div>
            <button
              type="button"
              onClick={() => revoke(row.id)}
              className="rounded-md border border-red-300 px-3 py-1.5 text-red-600"
            >
              Revoke access
            </button>
          </div>
        ))}
      </section>
    </div>
  );
};
