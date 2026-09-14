"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { safeRedirectTo } from "@/lib/utils/safe-redirect";
import { checkRateLimit } from "@/lib/rate-limit";
import { createLoginProofToken } from "@/lib/auth/login-proof";
import { verifyFormationCredentials, verifyFormationTotp } from "@/lib/auth/formation-credentials";

export type ActionState = { error?: string } | undefined;

const PENDING_2FA_COOKIE = "hub_pending_2fa";

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const allowed = await checkRateLimit("login", 10, 5 * 60 * 1000);
  if (!allowed) return { error: "Too many attempts. Try again in a few minutes." };

  const email = formData.get("email");
  const password = formData.get("password");
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return { error: "Enter your email and password." };
  }

  const redirectTo = safeRedirectTo(formData.get("redirectTo"));

  let result;
  try {
    result = await verifyFormationCredentials(email.trim().toLowerCase(), password);
  } catch {
    return { error: "Couldn't reach sign-in right now. Try again in a moment." };
  }

  if (!result.ok) {
    if (result.reason === "totp_required") {
      const cookieStore = await cookies();
      cookieStore.set(PENDING_2FA_COOKIE, result.pendingToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 5 * 60,
        path: "/",
      });
      redirect(`/login/2fa?redirectTo=${encodeURIComponent(redirectTo)}`);
    }
    return { error: result.reason === "rate_limited" ? "Too many attempts. Try again in a few minutes." : "Invalid email or password." };
  }

  try {
    await signIn("credentials", {
      proofToken: createLoginProofToken({ sub: result.sub, email: result.email, name: result.name, picture: result.picture }),
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Something went wrong signing you in. Try again." };
    }
    throw error;
  }
}

/** The second step for a 2FA account — see loginAction above. Reads the short-lived cookie
 *  Formation issued (proof the password already checked out) rather than ever asking for the
 *  password again here. */
export async function verifyTwoFactorAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const allowed = await checkRateLimit("2fa_verify", 10, 5 * 60 * 1000);
  if (!allowed) return { error: "Too many attempts. Try again in a few minutes." };

  const cookieStore = await cookies();
  const pendingToken = cookieStore.get(PENDING_2FA_COOKIE)?.value;
  if (!pendingToken) return { error: "That took too long — log in again." };

  const code = String(formData.get("code") ?? "").trim();
  if (!code) return { error: "Enter a code." };

  const redirectTo = safeRedirectTo(formData.get("redirectTo"));

  let result;
  try {
    result = await verifyFormationTotp(pendingToken, code);
  } catch {
    return { error: "Couldn't reach sign-in right now. Try again in a moment." };
  }

  if (!result.ok) {
    return { error: "Incorrect code." };
  }

  try {
    await signIn("credentials", {
      proofToken: createLoginProofToken({ sub: result.sub, email: result.email, name: result.name, picture: result.picture }),
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Something went wrong signing you in. Try again." };
    }
    throw error;
  }
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
