import type { CSSProperties } from "react";
import type { FormField } from "@/lib/types";
import { sanitizeRichText } from "@/lib/rich-text";
import { cn } from "@/lib/utils";

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
  if (field.type === "image") {
    return (
      <ComponentFrame field={field}>
        <figure>
          {field.imageUrl ? (
            // The image URL is user-configurable and may point to any host.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={field.imageUrl}
              alt={field.imageAlt || ""}
              className="w-full border border-black/5"
              style={{
                maxHeight: 420,
                borderRadius: field.componentStyle.borderRadius ?? 12,
                objectFit: field.imageFit ?? "cover",
              }}
            />
          ) : (
            <div className="grid min-h-40 place-items-center rounded-[10px] border border-dashed border-[var(--ff-input-border,#D2D2D7)] text-[12px] text-[#86868B]">
              Add an image URL in the inspector
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
