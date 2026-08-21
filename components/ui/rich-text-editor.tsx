"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import {
  Link01Icon,
  ListViewIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import { sanitizeRichText } from "@/lib/rich-text";

function ToolbarButton({
  label,
  active,
  disabled,
  children,
  onAction,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onAction: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      disabled={disabled}
      onClick={onAction}
      className={cn(
        "grid size-7 place-items-center rounded-[6px] text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 disabled:opacity-35",
        active && "bg-muted text-foreground"
      )}
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
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
        },
      }),
      Underline,
    ],
    content: sanitizeRichText(value),
    editorProps: {
      attributes: {
        class:
          "rich-text-editor px-3 py-2 text-[12px] leading-5 outline-none",
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": "Rich text content",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor || editor.isFocused) return;
    const next = sanitizeRichText(value);
    if (editor.getHTML() !== next) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div
        className={cn("rounded-[8px] border border-input bg-card", className)}
        style={{ minHeight }}
      />
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[8px] border border-input bg-card focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/15",
        className
      )}
    >
      <div
        className="flex items-center gap-0.5 border-b border-border/70 bg-muted/35 px-1 py-1"
        role="toolbar"
        aria-label="Text formatting"
      >
        <ToolbarButton
          label="Bold"
          active={editor.isActive("bold")}
          onAction={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor.isActive("italic")}
          onAction={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          label="Underline"
          active={editor.isActive("underline")}
          onAction={() => editor.chain().focus().toggleUnderline().run()}
        >
          <span className="underline">U</span>
        </ToolbarButton>
        <span className="mx-1 h-4 w-px bg-border" aria-hidden />
        <ToolbarButton
          label="Heading"
          active={editor.isActive("heading", { level: 3 })}
          onAction={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H
        </ToolbarButton>
        <ToolbarButton
          label="Bulleted list"
          active={editor.isActive("bulletList")}
          onAction={() => editor.chain().focus().toggleBulletList().run()}
        >
          <Icon icon={ListViewIcon} size={13} />
        </ToolbarButton>
        <ToolbarButton
          label="Add link"
          active={editor.isActive("link")}
          onAction={() => {
            const previousUrl = editor.getAttributes("link").href as string | undefined;
            const url = window.prompt("Link URL", previousUrl || "https://");
            if (url === null) return;
            if (!url.trim()) {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              return;
            }
            editor
              .chain()
              .focus()
              .extendMarkRange("link")
              .setLink({ href: url.trim() })
              .run();
          }}
        >
          <Icon icon={Link01Icon} size={13} />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} style={{ minHeight }} />
    </div>
  );
}
