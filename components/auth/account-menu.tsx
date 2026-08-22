"use client";

import Link from "next/link";
import {
  Login01Icon,
  Logout01Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AccountMenu() {
  const auth = useAuth();

  if (!auth.configured || auth.isGuest || !auth.user) {
    return (
      <Link
        href="/auth"
        className="flex h-7 items-center gap-1.5 rounded-[7px] px-2 text-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Icon icon={Login01Icon} size={12} />
        Sign in
      </Link>
    );
  }

  const label =
    (auth.user.user_metadata?.display_name as string | undefined) ??
    auth.user.email ??
    "Account";
  const initials = label
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="h-8 max-w-40 justify-start px-1.5" />
        }
      >
        <span className="grid size-6 place-items-center rounded-full bg-foreground text-[9px] font-medium text-background">
          {initials || <Icon icon={UserCircleIcon} size={13} />}
        </span>
        <span className="truncate text-[10px]">{label}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuLabel>
          <span className="block text-[10px] font-medium">Account</span>
          <span className="block truncate text-[9px] font-normal text-muted-foreground">
            {auth.user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            try {
              await auth.signOut();
              toast.success("Signed out");
            } catch {
              toast.error("Could not sign out");
            }
          }}
        >
          <Icon icon={Logout01Icon} size={12} />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
