import { NextResponse } from "next/server";

const FALLBACK_FONTS = [
  "Inter",
  "DM Sans",
  "Manrope",
  "Space Grotesk",
  "Playfair Display",
  "Source Serif 4",
  "JetBrains Mono",
  "Lora",
  "Roboto",
  "Open Sans",
  "Montserrat",
  "Poppins",
];

export async function GET() {
  try {
    const response = await fetch("https://fonts.google.com/metadata/fonts", {
      next: { revalidate: 86_400 },
    });
    if (!response.ok) throw new Error("Google Fonts metadata request failed");

    const text = await response.text();
    const metadata = JSON.parse(text.replace(/^\)\]\}'\s*/, "")) as {
      familyMetadataList?: { family?: string }[];
    };
    const fonts = (metadata.familyMetadataList ?? [])
      .map((item) => item.family)
      .filter((family): family is string => Boolean(family))
      .sort((a, b) => a.localeCompare(b));

    return NextResponse.json({ fonts: fonts.length ? fonts : FALLBACK_FONTS });
  } catch {
    return NextResponse.json({ fonts: FALLBACK_FONTS });
  }
}
