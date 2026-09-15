import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Lock, Bot, ArrowRight, Users, Receipt } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { safeRedirectTo } from "@/lib/utils/safe-redirect";
import { FORMATION_URL, VAULT_URL, SITE_URL } from "@/lib/site-url";

const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Esports Tools",
  url: SITE_URL,
  description:
    "Software for competitive esports organizations — Formation for team management, Vault for sponsorships and finance, one shared account across the family.",
};

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage({
  searchParams,
}: {
  // Populated when /oauth/authorize bounces an unauthenticated visitor here (see
  // app/oauth/authorize/route.ts) mid-way through some other app's sign-in flow — resuming there
  // once they sign in, instead of always landing on /home, is what makes that flow work at all.
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  // admin.esports-tools.com is the same app/container as the bare hostname (see Caddyfile in the
  // Formation repo) — this just sends the bare subdomain straight to the dashboard instead of the
  // marketing page. The actual gate (session + admin email) lives in app/admin/layout.tsx, not
  // here — this redirect fires regardless of auth state.
  const host = (await headers()).get("host") ?? "";
  if (host.startsWith("admin.")) redirect("/admin");

  const session = await auth();
  const { redirectTo } = await searchParams;
  const target = safeRedirectTo(redirectTo);
  if (session?.user) redirect(target);

  return (
    <div className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD).replace(/</g, "\\u003c") }}
      />
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="text-lg font-semibold">
            <Logo />
          </div>
          <Button asChild>
            <Link href={`/login?redirectTo=${encodeURIComponent(target)}`}>Sign in</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* ---------- Hero ---------- */}
        <section className="relative overflow-hidden">
          {/* A soft brand-colored glow plus a faint dot-grid, both static — no blurred rotating
              blobs. Grounded, not generated. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div
              className="absolute inset-x-0 top-0 h-[32rem]"
              style={{ background: "radial-gradient(640px circle at 50% -10%, oklch(from var(--primary) l c h / 0.16), transparent 65%)" }}
            />
            <div
              className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08]"
              style={{
                backgroundImage: "radial-gradient(var(--foreground) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
                maskImage: "radial-gradient(ellipse 60% 50% at 50% 0%, black, transparent 70%)",
                WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 0%, black, transparent 70%)",
              }}
            />
          </div>

          <div className="mx-auto max-w-6xl px-6 pt-20 text-center sm:pt-28">
            <p className="fx-rise mb-4 text-sm font-medium tracking-wide text-muted-foreground">
              One account, every tool
            </p>
            <h1 className="fx-rise text-balance text-4xl font-bold tracking-tight sm:text-6xl" style={{ animationDelay: "80ms" }}>
              Software for running a competitive esports organization.
            </h1>
            <p className="fx-rise mx-auto mt-5 max-w-2xl text-lg text-muted-foreground" style={{ animationDelay: "160ms" }}>
              Formation, Vault, and the tools we&apos;re building next all sign in with the same account —
              one identity for your whole org across everything you run on esports-tools.com.
            </p>
            <div className="fx-rise mt-8 flex flex-wrap justify-center gap-3" style={{ animationDelay: "240ms" }}>
              <Button size="lg" className="group" asChild>
                <Link href={`/login?redirectTo=${encodeURIComponent(target)}`}>
                  Sign in
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={`${FORMATION_URL}/signup`}>New here? Request access</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ---------- Products ---------- */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">The lineup</h2>
            <p className="mt-2 text-muted-foreground">Each one does one job well — and they all know who you are.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="flex flex-col">
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-chart-2/10">
                  <ShieldCheck className="size-5.5 text-chart-2" />
                </div>
                <h3 className="text-lg font-semibold">Formation</h3>
                <p className="mt-1.5 flex-1 text-sm text-muted-foreground">
                  Rosters, scheduling, availability, strategy playbooks, scrim matchmaking, and recruitment —
                  team management for the whole org, not just the starters.
                </p>
                <Button variant="outline" className="mt-5 w-full" asChild>
                  <Link href={FORMATION_URL}>
                    Explore Formation
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="flex flex-col">
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-chart-3/10">
                  <Lock className="size-5.5 text-chart-3" />
                </div>
                <h3 className="text-lg font-semibold">Vault</h3>
                <p className="mt-1.5 flex-1 text-sm text-muted-foreground">
                  Sponsorship and finance in one place — sponsors, contracts, deliverables, and invoices,
                  so revenue doesn&apos;t live in someone&apos;s inbox.
                </p>
                <Button variant="outline" className="mt-5 w-full" asChild>
                  <Link href={VAULT_URL}>
                    Explore Vault
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="flex flex-col border-dashed">
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex size-11 items-center justify-center rounded-lg bg-muted">
                    <Bot className="size-5.5 text-muted-foreground" />
                  </div>
                  <Badge variant="secondary">Coming soon</Badge>
                </div>
                <h3 className="text-lg font-semibold">Atlas</h3>
                <p className="mt-1.5 flex-1 text-sm text-muted-foreground">
                  AI-powered Valorant coaching — VOD breakdowns and practice plans built from your own team&apos;s
                  matches.
                </p>
                <div className="relative mt-5">
                  <WaitlistForm product="Atlas" />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ---------- Why one account ---------- */}
        <section className="border-t bg-muted/30">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="grid gap-8 sm:grid-cols-2">
              <div className="flex gap-4">
                <Users className="size-6 shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold">Your Formation account is the account</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Sign in once, here or in any product, and you&apos;re signed in everywhere else too — no
                    second password to manage, no second invite to accept.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Receipt className="size-6 shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold">Built to add up, not stack up</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Every tool in the family is a focused product on its own, sharing one identity instead of
                    bolting everything into a single sprawling app.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <p>esports-tools.com — built for competitive esports organizations.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link href="/privacy" className="hover:text-foreground hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground hover:underline">
              Terms
            </Link>
            <Link href={`${FORMATION_URL}/guide`} className="hover:text-foreground hover:underline">
              User guide
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
