import Link from "next/link";
import { LogOut, UserCog } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/actions/auth";

export function AppHeader({ user }: { user: { name?: string | null; email?: string | null; image?: string | null } }) {
  const initials = (user.name ?? user.email ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/70 px-4 backdrop-blur-md supports-backdrop-filter:bg-background/60 sm:px-6">
      <Link href="/home" className="font-semibold">
        <Logo size="size-5" />
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="size-8">
              {user.image ? <AvatarImage src={user.image} alt={user.name ?? ""} /> : null}
              <AvatarFallback>{initials || "?"}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/account">
              <UserCog className="size-4" />
              Account
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <form action={signOutAction} className="w-full">
            <button type="submit" className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-destructive">
              <LogOut className="size-4" />
              Sign out
            </button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
