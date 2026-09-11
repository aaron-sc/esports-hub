"use server";

import { sendDiscordWebhook, HUB_EMBED_COLOR } from "@/lib/discord-webhook";
import { checkRateLimit } from "@/lib/rate-limit";

export type WaitlistState = { error?: string; success?: boolean } | undefined;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Public, unauthenticated — collects interest in Atlas ahead of its own launch. No database:
 *  posts straight to the operator's Discord, same as Formation's contact form does. */
export async function joinWaitlistAction(_prev: WaitlistState, formData: FormData): Promise<WaitlistState> {
  // Honeypot — a real visitor never sees this field.
  if (String(formData.get("company") ?? "").trim()) return { success: true };

  const allowed = await checkRateLimit("waitlist", 5, 60 * 60 * 1000);
  if (!allowed) return { error: "Too many submissions from this network — try again later." };

  const email = String(formData.get("email") ?? "").trim();
  const product = String(formData.get("product") ?? "Atlas").trim();
  if (!EMAIL_PATTERN.test(email)) return { error: "Enter a valid email address." };

  const webhookUrl = process.env.FEEDBACK_DISCORD_WEBHOOK_URL;
  if (webhookUrl) {
    await sendDiscordWebhook(webhookUrl, [
      { title: `${product} waitlist signup`, description: email, color: HUB_EMBED_COLOR },
    ]);
  }

  return { success: true };
}
