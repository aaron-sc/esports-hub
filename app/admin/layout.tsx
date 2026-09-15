import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";

/**
 * The actual gate for /admin/* — a personal console, visible to nobody but the operator. No
 * session at all sends you to log in (you might just not be signed in yet); a real session that
 * isn't the configured admin email gets a plain 404, not a "you're not authorized" message —
 * there's no reason to reveal this exists to anyone else who happens to sign into the hub.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?redirectTo=/admin");
  if (session.user.email !== process.env.ADMIN_EMAIL) notFound();

  return <>{children}</>;
}
