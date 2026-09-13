/** Only ever a same-origin relative path — never let a caller-supplied redirect target leave this
 *  app, the same rule Formation's own /login enforces on its ?redirectTo=. Shared between the
 *  landing page (reading ?redirectTo= from the URL, e.g. when /oauth/authorize bounces an
 *  unauthenticated visitor here) and signInAction (reading it from the sign-in form). */
export function safeRedirectTo(value: string | FormDataEntryValue | null | undefined): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return "/home";
  return value;
}
