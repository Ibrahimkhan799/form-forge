"use client";

import { useEffect } from "react";

function googleFontUrl(families: string[]) {
  const query = Array.from(new Set(families))
    .filter(Boolean)
    .map((family) => `family=${encodeURIComponent(family).replaceAll("%20", "+")}`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${query}&display=swap`;
}

export function GoogleFontLoader({ families }: { families: string[] }) {
  const href = googleFontUrl(families);

  useEffect(() => {
    const id = "formforge-google-fonts";
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = href;
  }, [href]);

  return null;
}
