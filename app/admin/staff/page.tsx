import { UserRole } from "@prisma/client";
import { StaffManager } from "@/components/admin/staff-manager";
import { db } from "@/lib/db";

export default async function AdminStaffPage() {
  const staffUsers = await db.user.findMany({
    where: { role: { in: [UserRole.ADMIN, UserRole.STAFF] } },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true },
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Staff Management</h1>
        <p className="text-sm text-zinc-500">Assign or revoke admin/staff access roles.</p>
      </div>
      <StaffManager staffUsers={staffUsers} />
    </section>
  );
}
