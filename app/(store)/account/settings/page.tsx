import { AccountSettingsClient } from "@/components/shared/account-settings-client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function AccountSettingsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, image: true },
  });
  if (!user) {
    return null;
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">Account Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">Update profile details, avatar, and password.</p>
      </div>
      <AccountSettingsClient
        initialName={user.name ?? ""}
        initialEmail={user.email ?? ""}
        initialImage={user.image ?? ""}
      />
    </section>
  );
}
