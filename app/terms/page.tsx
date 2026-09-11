import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { FORMATION_URL, VAULT_URL } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for using the esports-tools.com hub.",
  alternates: { canonical: "/terms" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-xl font-semibold tracking-tight">{title}</h2>
      <div className="space-y-3 text-muted-foreground">{children}</div>
    </section>
  );
}

export default function TermsPage() {
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
        <h1 className="mb-1 text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mb-10 text-sm text-muted-foreground">Effective September 2026</p>

        <Section title="What this site is">
          <p>
            esports-tools.com is a directory and single sign-on launcher for a family of separate products —
            currently{" "}
            <Link href={FORMATION_URL} className="text-primary underline underline-offset-4">
              Formation
            </Link>{" "}
            and{" "}
            <Link href={VAULT_URL} className="text-primary underline underline-offset-4">
              Vault
            </Link>
            . Each product has its own terms governing your actual use of it; these terms cover only this
            landing/launcher site and the shared sign-in it provides.
          </p>
        </Section>

        <Section title="Your account">
          <p>
            Your account is created and managed on Formation. Using it to sign in here means you agree to{" "}
            <Link href={`${FORMATION_URL}/terms`} className="text-primary underline underline-offset-4">
              Formation&apos;s terms of service
            </Link>{" "}
            as well as these.
          </p>
        </Section>

        <Section title="Acceptable use">
          <p>
            Don&apos;t attempt to interfere with, probe, or bypass the sign-in flow between this site and any
            product in the family, and don&apos;t use the waitlist forms to submit anyone&apos;s email but
            your own.
          </p>
        </Section>

        <Section title="Changes">
          <p>We may update these terms as the product family grows; the effective date above reflects the latest revision.</p>
        </Section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        esports-tools.com — built for competitive esports organizations.
      </footer>
    </div>
  );
}
