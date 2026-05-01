import { auth } from "@/lib/auth";

export const requireAdmin = async () => {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "ADMIN" && role !== "STAFF") {
    return null;
  }
  return session;
};
