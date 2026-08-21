import type { Metadata } from "next";
import {
  DM_Sans,
  Inter,
  JetBrains_Mono,
  Manrope,
  Playfair_Display,
  Source_Serif_4,
  Space_Grotesk,
} from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "FormForge",
  description: "A minimal no-code form builder inspired by Typeform, Google Forms, and Webflow.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${dmSans.variable} ${manrope.variable} ${spaceGrotesk.variable} ${playfair.variable} ${sourceSerif.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
