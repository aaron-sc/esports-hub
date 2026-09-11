"use server";

import { signIn, signOut } from "@/auth";

/** Only ever a same-origin relative path — never let a caller-supplied redirect target leave
 *  this app, the same rule Formation's own /login enforces on its ?redirectTo=. */
function safeRedirectTo(value: FormDataEntryValue | null): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return "/home";
  return value;
}

export async function signInAction(formData: FormData): Promise<void> {
  await signIn("formation", { redirectTo: safeRedirectTo(formData.get("redirectTo")) });
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
