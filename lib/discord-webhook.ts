import "server-only";

type DiscordEmbed = {
  title?: string;
  description?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
};

/** Same minimal helper Formation uses for its contact form / feature-request button — a plain
 *  incoming-webhook POST, no bot/token involved. */
export async function sendDiscordWebhook(webhookUrl: string, embeds: DiscordEmbed[]): Promise<{ ok: boolean }> {
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds }),
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}

export const HUB_EMBED_COLOR = 0x6366f1;
