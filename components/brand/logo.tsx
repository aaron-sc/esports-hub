import { cn } from "@/lib/utils";

/**
 * The hub's mark — fixed brand-blue, a small hub-and-spoke: one center node connected to three
 * satellites, standing in for Formation / Vault / what's next, all reachable from one account.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={cn("shrink-0", className)} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#2563EB" />
      <g stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round">
        <line x1="16" y1="16" x2="16" y2="8" />
        <line x1="16" y1="16" x2="9.2" y2="20" />
        <line x1="16" y1="16" x2="22.8" y2="20" />
      </g>
      <circle cx="16" cy="16" r="3" fill="#ffffff" />
      <circle cx="16" cy="8" r="2" fill="#ffffff" />
      <circle cx="9.2" cy="20" r="2" fill="#ffffff" />
      <circle cx="22.8" cy="20" r="2" fill="#ffffff" />
    </svg>
  );
}

/**
 * Icon + wordmark — the "<mark/> Esports Tools" pair repeated across the header and marketing
 * pages. `size` is a Tailwind size-* utility for the mark; pass `wordmark={false}` for icon-only
 * spots.
 */
export function Logo({
  size = "size-6",
  className,
  wordmark = true,
}: {
  size?: string;
  className?: string;
  wordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={size} />
      {wordmark && "Esports Tools"}
    </span>
  );
}
