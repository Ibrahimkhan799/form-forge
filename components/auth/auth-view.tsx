"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight01Icon,
  LockPasswordIcon,
  Mail01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { BrandMark } from "@/components/brand";
import { Icon } from "@/components/icon";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";

export function AuthView() {
  const router = useRouter();
  const auth = useAuth();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authenticated = auth.user && !auth.isGuest;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (mode === "sign-in") await auth.signIn(email, password);
      else await auth.signUp(name, email, password);
      toast.success(
        mode === "sign-in"
          ? "Welcome back"
          : "Account created. Check your email if confirmation is enabled."
      );
      router.push("/");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (!auth.configured) {
    return (
      <AuthShell>
        <div className="rounded-[10px] border border-border bg-card p-4">
          <h1 className="text-[18px] font-semibold">Authentication setup required</h1>
          <p className="mt-2 text-[12px] leading-5 text-muted-foreground">
            Add the Supabase project URL and publishable key to{" "}
            <code>.env.local</code>, then enable Email and Anonymous providers.
          </p>
          <Link href="/" className={cn(buttonVariants(), "mt-4 w-full")}>
            Continue in local mode
          </Link>
        </div>
      </AuthShell>
    );
  }

  if (authenticated) {
    return (
      <AuthShell>
        <div className="rounded-[10px] border border-border bg-card p-4">
          <p className="text-[11px] text-muted-foreground">Signed in as</p>
          <p className="mt-1 truncate text-[14px] font-medium">{auth.user?.email}</p>
          <Link href="/" className={cn(buttonVariants(), "mt-4 w-full")}>
            Open workspace
            <Icon icon={ArrowRight01Icon} size={13} />
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="rounded-[12px] border border-border bg-card p-5 shadow-[0_16px_50px_rgba(0,0,0,0.08)]">
        <div className="grid grid-cols-2 rounded-[8px] bg-muted p-0.5">
          {(["sign-in", "sign-up"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setMode(value);
                setError(null);
              }}
              className={cn(
                "h-8 rounded-[7px] text-[11px] transition-colors",
                mode === value
                  ? "bg-card font-medium shadow-[0_1px_2px_rgba(0,0,0,0.07)]"
                  : "text-muted-foreground"
              )}
            >
              {value === "sign-in" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        <div className="mt-5">
          <h1 className="text-[20px] font-semibold tracking-tight">
            {mode === "sign-in" ? "Welcome back" : "Create your workspace"}
          </h1>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {mode === "sign-in"
              ? "Continue building and reviewing responses."
              : "Your current guest forms will move with your account."}
          </p>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-3">
          {mode === "sign-up" ? (
            <AuthInput
              icon={UserIcon}
              type="text"
              value={name}
              onChange={setName}
              placeholder="Your name"
              autoComplete="name"
              required
            />
          ) : null}
          <AuthInput
            icon={Mail01Icon}
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
          <AuthInput
            icon={LockPasswordIcon}
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Password"
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            minLength={6}
            required
          />

          {error ? (
            <p role="alert" className="rounded-[7px] bg-destructive/8 px-3 py-2 text-[10px] text-destructive">
              {error}
            </p>
          ) : null}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting
              ? "Please wait…"
              : mode === "sign-in"
                ? "Sign in"
                : "Create account"}
            {!submitting ? <Icon icon={ArrowRight01Icon} size={13} /> : null}
          </Button>
        </form>

        {mode === "sign-in" ? (
          <button
            type="button"
            onClick={async () => {
              if (!email) {
                setError("Enter your email first");
                return;
              }
              try {
                await auth.sendPasswordReset(email);
                toast.success("Password reset email sent");
              } catch (reason) {
                setError(reason instanceof Error ? reason.message : "Could not send reset email");
              }
            }}
            className="mt-3 w-full text-center text-[10px] text-muted-foreground hover:text-foreground"
          >
            Forgot password?
          </button>
        ) : null}

        <div className="my-4 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[9px] text-muted-foreground">or</span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={async () => {
            setSubmitting(true);
            try {
              await auth.continueAsGuest();
              router.push("/");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          Continue as guest
        </Button>
      </div>
    </AuthShell>
  );
}

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-5 flex justify-center">
          <BrandMark />
        </div>
        {children}
      </div>
    </main>
  );
}

function AuthInput({
  icon,
  value,
  onChange,
  ...props
}: Omit<React.ComponentProps<"input">, "value" | "onChange"> & {
  icon: Parameters<typeof Icon>[0]["icon"];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <Icon
        icon={icon}
        size={13}
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        {...props}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 pl-9"
      />
    </div>
  );
}
