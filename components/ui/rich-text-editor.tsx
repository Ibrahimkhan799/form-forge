"use client";

import { useEffect, useRef } from "react";
import {
  Link01Icon,
  ListViewIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import { sanitizeRichText } from "@/lib/rich-text";

function ToolbarButton({
  label,
  children,
  onAction,
}: {
  label: string;
  children: React.ReactNode;
  onAction: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onMouseDown={(event) => {
        event.preventDefault();
        onAction();
      }}
      className="grid size-7 place-items-center rounded-[6px] text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  minHeight = 120,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  minHeight?: number;
  className?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || document.activeElement === editor) return;
    const sanitized = sanitizeRichText(value);
    if (editor.innerHTML !== sanitized) editor.innerHTML = sanitized;
  }, [value]);

  function command(name: string, commandValue?: string) {
    editorRef.current?.focus();
    document.execCommand(name, false, commandValue);
    onChange(editorRef.current?.innerHTML ?? "");
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[8px] border border-input bg-card focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/15",
        className
      )}
    >
      <div className="flex items-center gap-0.5 border-b border-border/70 bg-muted/35 px-1 py-1">
        <ToolbarButton label="Bold" onAction={() => command("bold")}>
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton label="Italic" onAction={() => command("italic")}>
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton label="Underline" onAction={() => command("underline")}>
          <span className="underline">U</span>
        </ToolbarButton>
        <span className="mx-1 h-4 w-px bg-border" />
        <ToolbarButton label="Heading" onAction={() => command("formatBlock", "h3")}>
          H
        </ToolbarButton>
        <ToolbarButton
          label="Bulleted list"
          onAction={() => command("insertUnorderedList")}
        >
          <Icon icon={ListViewIcon} size={13} />
        </ToolbarButton>
        <ToolbarButton
          label="Add link"
          onAction={() => {
            const url = window.prompt("Link URL");
            if (url) command("createLink", url);
          }}
        >
          <Icon icon={Link01Icon} size={13} />
        </ToolbarButton>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        className="rich-text-editor px-3 py-2 text-[12px] leading-5 outline-none"
        style={{ minHeight }}
        dangerouslySetInnerHTML={{ __html: sanitizeRichText(value) }}
      />
    </div>
  );
}
