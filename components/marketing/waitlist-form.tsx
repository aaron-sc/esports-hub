"use client";

import { useActionState } from "react";
import { joinWaitlistAction, type WaitlistState } from "@/lib/actions/waitlist";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { Check } from "lucide-react";

export function WaitlistForm({ product }: { product: string }) {
  const [state, formAction] = useActionState<WaitlistState, FormData>(joinWaitlistAction, undefined);

  if (state?.success) {
    return (
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Check className="size-4 text-primary" />
        You&apos;re on the list — we&apos;ll email you when {product} opens up.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex gap-2">
      <input type="hidden" name="product" value={product} />
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`company-${product}`}>Company</label>
        <input id={`company-${product}`} name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <Input
        name="email"
        type="email"
        placeholder="you@yourorg.com"
        required
        className="bg-background"
        aria-label="Email address"
      />
      <SubmitButton variant="outline">Notify me</SubmitButton>
      {state?.error ? <p className="absolute mt-10 text-xs text-destructive">{state.error}</p> : null}
    </form>
  );
}
