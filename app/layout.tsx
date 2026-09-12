import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SITE_URL } from "@/lib/site-url";
import "./globals.css";

// Display face — hero copy, page titles (see globals.css's --font-display).
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

// Body/UI face — nav, buttons, forms, everything else (see globals.css's --font-body).
const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "Esports Tools — Software for Competitive Esports Organizations";
const description =
  "One account for every tool your esports org runs on — Formation for team management, Vault for sponsorships and finance, and more on the way.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: title, template: "%s | Esports Tools" },
  description,
  robots: { index: true, follow: true },
  openGraph: { title, description, url: SITE_URL, siteName: "Esports Tools", type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${hanken.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider>
            {children}
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
