"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4">
      <form
        className="w-full max-w-sm rounded-[12px] border border-border bg-card p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          setSubmitting(true);
          setError(null);
          const supabase = getSupabaseClient();
          if (!supabase) {
            setError("Supabase authentication is not configured");
            setSubmitting(false);
            return;
          }
          const { error: updateError } = await supabase.auth.updateUser({
            password,
          });
          if (updateError) {
            setError(updateError.message);
            setSubmitting(false);
            return;
          }
          router.push("/");
        }}
      >
        <BrandMark />
        <h1 className="mt-5 text-[18px] font-semibold">Choose a new password</h1>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Use at least six characters.
        </p>
        <Input
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-4 h-9"
        />
        {error ? (
          <p className="mt-2 text-[10px] text-destructive">{error}</p>
        ) : null}
        <Button type="submit" disabled={submitting} className="mt-4 w-full">
          {submitting ? "Updating…" : "Update password"}
        </Button>
      </form>
    </main>
  );
}
