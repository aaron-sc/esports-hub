import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock, Bot, ArrowUpRight } from "lucide-react";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { FORMATION_URL, VAULT_URL } from "@/lib/site-url";

export const metadata: Metadata = { title: "Your apps" };

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader user={session.user} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <h1 className="mb-1 text-2xl font-semibold">
          {session.user.name ? `Hey, ${session.user.name.split(" ")[0]}` : "Your apps"}
        </h1>
        <p className="mb-8 text-muted-foreground">Pick where you&apos;re headed — you&apos;re signed in everywhere.</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <a href={FORMATION_URL} className="group block">
            <Card className="h-full transition-colors group-hover:border-chart-2/40">
              <CardContent className="flex h-full flex-col p-6">
                <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-chart-2/10">
                  <ShieldCheck className="size-5.5 text-chart-2" />
                </div>
                <h2 className="flex items-center gap-1.5 text-lg font-semibold">
                  Formation
                  <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Rosters, scheduling, strategy, and recruitment.
                </p>
              </CardContent>
            </Card>
          </a>

          <a href={VAULT_URL} className="group block">
            <Card className="h-full transition-colors group-hover:border-chart-3/40">
              <CardContent className="flex h-full flex-col p-6">
                <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-chart-3/10">
                  <Lock className="size-5.5 text-chart-3" />
                </div>
                <h2 className="flex items-center gap-1.5 text-lg font-semibold">
                  Vault
                  <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">Sponsors, contracts, and invoices.</p>
              </CardContent>
            </Card>
          </a>
        </div>

        <Card className="mt-4 border-dashed">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Bot className="size-5.5 text-muted-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">Atlas</h2>
                  <Badge variant="secondary">Coming soon</Badge>
                </div>
                <p className="text-sm text-muted-foreground">AI-powered Valorant coaching.</p>
              </div>
            </div>
            <div className="relative sm:w-72">
              <WaitlistForm product="Atlas" />
            </div>
          </CardContent>
        </Card>

        <div className="mt-10 border-t pt-6">
          <Button variant="link" className="h-auto p-0 text-muted-foreground" asChild>
            <a href={`${FORMATION_URL}/guide`}>Need help getting started? Read the user guide</a>
          </Button>
        </div>
      </main>
    </div>
  );
}
