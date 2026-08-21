"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { Image01Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import type { FormField } from "@/lib/types";
import { sanitizeRichText } from "@/lib/rich-text";
import { cn } from "@/lib/utils";
import { useAssetUrl } from "@/hooks/use-asset-url";
import { Icon } from "@/components/icon";

const WIDTH_CLASS = {
  full: "w-full",
  half: "w-full sm:w-1/2",
  third: "w-full sm:w-1/3",
} as const;

export function ComponentFrame({
  field,
  children,
  className,
}: {
  field: FormField;
  children: React.ReactNode;
  className?: string;
}) {
  const style = field.componentStyle;
  const frameStyle: CSSProperties = {
    textAlign: style.alignment,
    backgroundColor: style.backgroundColor || undefined,
    color: style.textColor || undefined,
    padding: style.padding,
    borderRadius: style.borderRadius,
    marginLeft: style.alignment === "right" ? "auto" : style.alignment === "center" ? "auto" : 0,
    marginRight: style.alignment === "center" ? "auto" : style.alignment === "left" ? "auto" : 0,
  };

  return (
    <div className={cn(WIDTH_CLASS[style.width], className)} style={frameStyle}>
      {children}
    </div>
  );
}

export function ShowcaseField({ field }: { field: FormField }) {
  const storedAsset = useAssetUrl(field.imageAsset);

  if (field.type === "image") {
    const source =
      storedAsset.url ??
      (!field.imageAsset || storedAsset.error ? field.imageUrl : undefined);

    return (
      <ComponentFrame field={field}>
        <figure>
          {field.imageAsset && storedAsset.loading ? (
            <div className="grid min-h-44 place-items-center rounded-[10px] border border-black/5 bg-black/[0.03]">
              <Icon icon={Loading03Icon} size={20} className="animate-spin text-[#86868B]" />
            </div>
          ) : source ? (
            <ImageWithState
              key={source}
              src={source}
              alt={field.imageAlt || ""}
              fit={field.imageFit ?? "cover"}
              radius={field.componentStyle.borderRadius ?? 12}
            />
          ) : (
            <div className="grid min-h-40 place-items-center rounded-[10px] border border-dashed border-[var(--ff-input-border,#D2D2D7)] text-[12px] text-[#86868B]">
              {storedAsset.error || "Upload an image or add an image URL"}
            </div>
          )}
          {field.imageCaption ? (
            <figcaption className="mt-2 text-[12px] text-[#86868B]">
              {field.imageCaption}
            </figcaption>
          ) : null}
        </figure>
      </ComponentFrame>
    );
  }

  if (field.type === "richText") {
    return (
      <ComponentFrame field={field}>
        <div
          className="rich-text-content text-[15px] leading-6"
          dangerouslySetInnerHTML={{
            __html: sanitizeRichText(field.richText || ""),
          }}
        />
      </ComponentFrame>
    );
  }

  return null;
}

function ImageWithState({
  src,
  alt,
  fit,
  radius,
}: {
  src: string;
  alt: string;
  fit: "cover" | "contain";
  radius: number;
}) {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  return (
    <div
      className="relative min-h-36 overflow-hidden border border-black/5 bg-black/[0.03]"
      style={{ borderRadius: radius }}
    >
      {state === "loading" ? (
        <div className="absolute inset-0 grid place-items-center">
          <Icon icon={Loading03Icon} size={20} className="animate-spin text-[#86868B]" />
        </div>
      ) : null}
      {state === "error" ? (
        <div className="absolute inset-0 grid place-items-center text-center text-[12px] text-[#86868B]">
          <div>
            <Icon icon={Image01Icon} size={22} className="mx-auto mb-1" />
            Image could not be loaded
          </div>
        </div>
      ) : null}
      {/* The URL can be either an IndexedDB object URL or a user-provided remote URL. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onLoad={() => setState("ready")}
        onError={() => setState("error")}
        className={cn(
          "max-h-[420px] w-full",
          state === "ready" ? "opacity-100" : "opacity-0"
        )}
        style={{ objectFit: fit }}
      />
    </div>
  );
}
