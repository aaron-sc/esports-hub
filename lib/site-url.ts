// Canonical public URL for metadata, robots.txt, sitemap.xml, and JSON-LD — see Formation's
// identical lib/utils/site-url.ts for why this is a plain constant rather than request-derived.
export const SITE_URL = (process.env.APP_URL || (process.env.DOMAIN ? `https://${process.env.DOMAIN}` : null) || "https://esports-tools.com").replace(/\/$/, "");

// The other two products in the family — used on the landing page and the /home launcher. Each
// is its own separate app/repo/deploy; these are just where to send a browser.
export const FORMATION_URL = process.env.FORMATION_URL || "https://formation.esports-tools.com";
export const VAULT_URL = process.env.VAULT_URL || "https://vault.esports-tools.com";
