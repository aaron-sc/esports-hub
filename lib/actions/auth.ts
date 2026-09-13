"use server";

import { signIn, signOut } from "@/auth";
import { safeRedirectTo } from "@/lib/utils/safe-redirect";

export async function signInAction(formData: FormData): Promise<void> {
  await signIn("formation", { redirectTo: safeRedirectTo(formData.get("redirectTo")) });
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
