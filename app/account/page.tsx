import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppHeader } from "@/components/app-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KeyRound, ShieldCheck, Smartphone, ArrowUpRight } from "lucide-react";
import { FORMATION_URL } from "@/lib/site-url";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  const initials = (session.user.name ?? session.user.email ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader user={session.user} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <h1 className="mb-1 text-2xl font-semibold">Account</h1>
        <p className="mb-8 text-muted-foreground">
          Your identity across every esports-tools.com product — managed in one place, Formation.
        </p>

        <Card className="mb-6">
          <CardContent className="flex items-center gap-4 p-6">
            <Avatar className="size-14">
              {session.user.image ? <AvatarImage src={session.user.image} alt={session.user.name ?? ""} /> : null}
              <AvatarFallback className="text-lg">{initials || "?"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{session.user.name}</p>
              <p className="text-sm text-muted-foreground">{session.user.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Manage your account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="mb-3 text-sm text-muted-foreground">
              Your name, password, two-factor authentication, connected apps, and sign-in history all live on
              Formation — the identity provider for this account. Changes there apply everywhere immediately.
            </p>
            <Link
              href={`${FORMATION_URL}/account`}
              className="flex items-center justify-between rounded-md border p-3 text-sm transition-colors hover:bg-accent"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-muted-foreground" />
                Profile & password
              </span>
              <ArrowUpRight className="size-4 text-muted-foreground" />
            </Link>
            <Link
              href={`${FORMATION_URL}/account#two-factor`}
              className="flex items-center justify-between rounded-md border p-3 text-sm transition-colors hover:bg-accent"
            >
              <span className="flex items-center gap-2">
                <Smartphone className="size-4 text-muted-foreground" />
                Two-factor authentication
              </span>
              <ArrowUpRight className="size-4 text-muted-foreground" />
            </Link>
            <Link
              href={`${FORMATION_URL}/account#connected-apps`}
              className="flex items-center justify-between rounded-md border p-3 text-sm transition-colors hover:bg-accent"
            >
              <span className="flex items-center gap-2">
                <KeyRound className="size-4 text-muted-foreground" />
                Connected apps & sessions
              </span>
              <ArrowUpRight className="size-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>

        <Button variant="link" className="mt-6 h-auto p-0 text-muted-foreground" asChild>
          <Link href="/home">&larr; Back to your apps</Link>
        </Button>
      </main>
    </div>
  );
}
