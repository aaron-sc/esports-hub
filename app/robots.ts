import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Behind sign-in anyway — keep crawlers off pages that just redirect them to /.
      disallow: ["/home", "/account", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
