import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { safeRedirectTo } from "@/lib/utils/safe-redirect";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ redirectTo?: string }> }) {
  const { redirectTo: rawRedirectTo } = await searchParams;
  const redirectTo = safeRedirectTo(rawRedirectTo);

  const session = await auth();
  if (session?.user) redirect(redirectTo);

  return (
    <AuthShell title="Sign in" description="One account for every tool your org runs on esports-tools.com">
      <LoginForm redirectTo={redirectTo} />
    </AuthShell>
  );
}
