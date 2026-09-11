import { auth } from "@/auth";

// No auth.config.ts split here (unlike Formation/Vault) — there's no Prisma/bcrypt in this app to
// keep out of the edge runtime, so the one auth.ts config is edge-safe as-is.
export function proxy(...args: Parameters<typeof auth>) {
  return auth(...args);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
