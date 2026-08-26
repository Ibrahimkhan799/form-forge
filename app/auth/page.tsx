import type { Metadata } from "next";
import { AuthView } from "@/components/auth/auth-view";

export const metadata: Metadata = {
  title: "Sign in · FormForge",
};

export default function AuthPage() {
  return <AuthView />;
}
