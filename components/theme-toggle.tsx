"use client";

import { useEffect, useState } from "react";
import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";
import { useTheme } from "next-themes";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8 rounded-[8px]"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      <Icon icon={isDark ? Sun03Icon : Moon02Icon} size={16} />
    </Button>
  );
}
