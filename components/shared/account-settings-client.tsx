"use client";

import { useState } from "react";
import { ImageUploader } from "@/components/shared/image-uploader";

type AccountSettingsClientProps = {
  initialName: string;
  initialEmail: string;
  initialImage: string;
};

export const AccountSettingsClient = ({
  initialName,
  initialEmail,
  initialImage,
}: AccountSettingsClientProps) => {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [image, setImage] = useState(initialImage);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const saveProfile = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, image }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Failed to update profile.");
        return;
      }
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Failed to update password.");
        return;
      }
      setMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="space-y-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-lg font-semibold">Profile settings</h2>
        <div className="space-y-2">
          <p className="text-sm text-zinc-500">Avatar</p>
          <ImageUploader
            folder="avatars"
            multiple={false}
            maxFiles={1}
            onUpload={(urls) => setImage(urls[0] ?? "")}
            existingUrls={image ? [image] : []}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Full name"
          />
          <input
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email address"
          />
        </div>
        <button
          type="button"
          onClick={saveProfile}
          disabled={loading}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Save profile
        </button>
      </section>

      <section className="space-y-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-lg font-semibold">Change password</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="password"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            placeholder="Current password"
          />
          <input
            type="password"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="New password"
          />
        </div>
        <button
          type="button"
          onClick={changePassword}
          disabled={loading}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm disabled:opacity-60 dark:border-zinc-700"
        >
          Update password
        </button>
      </section>

      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
};
