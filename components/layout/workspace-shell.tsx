"use client";

import Link from "next/link";
import {
  AnalyticsUpIcon,
  Edit02Icon,
  FormIcon,
} from "@hugeicons/core-free-icons";
import { BrandMark } from "@/components/brand";
import { Icon } from "@/components/icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { AccountMenu } from "@/components/auth/account-menu";
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";

type WorkspaceSection = "forms" | "analytics";

export function WorkspaceShell({
  active,
  formId,
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  active: WorkspaceSection;
  formId?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const auth = useAuth();
  const workspaceLabel =
    auth.configured && auth.user && !auth.isGuest
      ? ((auth.user.user_metadata?.display_name as string | undefined) ??
        auth.user.email ??
        "Personal")
      : "Guest workspace";
  const links = [
    {
      label: "Forms",
      href: "/",
      icon: FormIcon,
      active: active === "forms",
    },
    ...(formId
      ? [
          {
            label: "Insights",
            href: `/analytics/${formId}`,
            icon: AnalyticsUpIcon,
            active: active === "analytics",
          },
          {
            label: "Open editor",
            href: `/builder/${formId}`,
            icon: Edit02Icon,
            active: false,
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-dvh bg-background md:grid md:grid-cols-[208px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border/80 bg-[#F4F4F2] p-3 dark:bg-[#171717] md:flex">
        <div className="px-2 py-1.5">
          <BrandMark />
        </div>

        <div className="mt-4 rounded-[8px] border border-border/80 bg-background/70 px-2.5 py-2">
          <p className="text-[10px] font-medium tracking-wide text-muted-foreground">
            WORKSPACE
          </p>
          <p className="mt-0.5 truncate text-[12px] font-medium">
            {workspaceLabel}
          </p>
        </div>

        <nav className="mt-3 space-y-0.5" aria-label="Workspace">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex h-8 items-center gap-2 rounded-[7px] px-2 text-[12px] transition-colors",
                link.active
                  ? "bg-white text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:bg-white/8"
                  : "text-muted-foreground hover:bg-black/4 hover:text-foreground dark:hover:bg-white/5"
              )}
            >
              <Icon icon={link.icon} size={14} strokeWidth={1.5} />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex items-center justify-between gap-1 border-t border-border/70 px-1 pt-3">
          <AccountMenu />
          <ThemeToggle />
        </div>
      </aside>

      <div className="min-w-0">
        <div className="flex h-12 items-center justify-between border-b border-border/70 px-4 md:hidden">
          <BrandMark />
          <div className="flex items-center gap-1">
            <AccountMenu />
            <ThemeToggle />
          </div>
        </div>

        <main className="mx-auto w-full max-w-[1180px] px-4 py-5 sm:px-6 sm:py-7">
          <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border/70 pb-5">
            <div className="min-w-0">
              {eyebrow ? (
                <p className="mb-1 text-[11px] font-medium text-muted-foreground">
                  {eyebrow}
                </p>
              ) : null}
              <h1 className="truncate text-[22px] font-semibold tracking-[-0.025em] text-foreground">
                {title}
              </h1>
              {description ? (
                <p className="mt-1 text-[12px] text-muted-foreground">{description}</p>
              ) : null}
            </div>
            {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
