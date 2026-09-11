import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { FORMATION_URL } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How esports-tools.com's hub handles your data.",
  alternates: { canonical: "/privacy" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-xl font-semibold tracking-tight">{title}</h2>
      <div className="space-y-3 text-muted-foreground">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <Sparkles className="size-6 text-primary" />
            Esports Tools
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <h1 className="mb-1 text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mb-10 text-sm text-muted-foreground">Effective September 2026</p>

        <Section title="What this covers">
          <p>
            This policy covers esports-tools.com&apos;s hub — the landing page and app launcher at this
            domain. It does not hold an account database of its own: your name, email, password, and
            security settings are all managed by{" "}
            <Link href={`${FORMATION_URL}/privacy`} className="text-primary underline underline-offset-4">
              Formation&apos;s privacy policy
            </Link>
            , the identity provider for every product in this family. This page covers only what the hub
            itself does.
          </p>
        </Section>

        <Section title="What the hub stores">
          <p>
            <strong className="text-foreground">A session cookie</strong>, once you sign in — it holds your
            name, email, and profile photo as confirmed by Formation, signed so it can&apos;t be tampered
            with, and expires after a couple of hours of inactivity. Nothing here reads or writes to a
            database.
          </p>
          <p>
            <strong className="text-foreground">A waitlist email</strong>, if you sign up for early access to
            an upcoming product (like Atlas) — sent directly to our team via Discord, not stored in any
            database on this site, and used only to notify you when that product opens up.
          </p>
        </Section>

        <Section title="Signing in">
          <p>
            Signing in here redirects you to Formation, which authenticates you and hands the hub back a
            signed confirmation of who you are (an industry-standard OpenID Connect login) — your password
            is entered on Formation&apos;s own site and never touches this one.
          </p>
        </Section>

        <Section title="Cookies">
          <p>
            One cookie: the session cookie described above. No analytics or advertising cookies are set on
            this domain.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about this policy or the esports-tools.com family generally can go through{" "}
            <Link href={`${FORMATION_URL}/contact`} className="text-primary underline underline-offset-4">
              Formation&apos;s contact form
            </Link>
            .
          </p>
        </Section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        esports-tools.com — built for competitive esports organizations.
      </footer>
    </div>
  );
}
