"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft01Icon,
  CloudSavingDone01Icon,
  EyeIcon,
  FloppyDiskIcon,
  HistoryIcon,
  Loading03Icon,
  PaletteIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
  PencilEdit01Icon,
  PlayIcon,
  Redo02Icon,
  Share01Icon,
  SourceCodeIcon,
  Undo02Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Icon } from "@/components/icon";
import { VersionHistory } from "@/components/builder/version-history";
import { ShareDialog } from "@/components/builder/share-dialog";
import { SchemaDialog } from "@/components/builder/schema-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { useBuilderStore, useBuilderTemporal } from "@/lib/store/builder-store";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

function HeaderButton({
  label,
  shortcut,
  disabled,
  onClick,
  className,
  children,
}: {
  label: string;
  shortcut?: string;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            disabled={disabled}
            onClick={onClick}
            className={cn(
              "size-7 rounded-[7px] text-foreground hover:bg-muted",
              className
            )}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>
        {label}
        {shortcut ? <span className="ml-2 text-white/60">{shortcut}</span> : null}
      </TooltipContent>
    </Tooltip>
  );
}

export function CanvasHeader({
  leftOpen,
  rightOpen,
  onToggleLeft,
  onToggleRight,
  onOpenAppearance,
  onEnterPreview,
}: {
  leftOpen: boolean;
  rightOpen: boolean;
  onToggleLeft: () => void;
  onToggleRight: () => void;
  onOpenAppearance: () => void;
  onEnterPreview: () => void;
}) {
  const form = useBuilderStore((state) => state.form);
  const mode = useBuilderStore((state) => state.mode);
  const saveStatus = useBuilderStore((state) => state.saveStatus);
  const setTitle = useBuilderStore((state) => state.setTitle);
  const setMode = useBuilderStore((state) => state.setMode);
  const canUndo = useBuilderTemporal((state) => state.pastStates.length > 0);
  const canRedo = useBuilderTemporal((state) => state.futureStates.length > 0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [schemaOpen, setSchemaOpen] = useState(false);

  if (!form) return null;

  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border/80 bg-card px-3">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Link
          href="/"
          className="grid size-7 place-items-center rounded-[7px] text-foreground transition-colors duration-150 hover:bg-muted"
          aria-label="Back to dashboard"
        >
          <Icon icon={ArrowLeft01Icon} size={18} />
        </Link>
        <HeaderButton
          label={leftOpen ? "Collapse left sidebar" : "Open left sidebar"}
          onClick={onToggleLeft}
        >
          <Icon
            icon={leftOpen ? PanelLeftCloseIcon : PanelLeftOpenIcon}
            size={15}
          />
        </HeaderButton>
        <div className="min-w-0">
          <Input
            value={form.title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-6 max-w-48 border-transparent bg-transparent px-1 text-[13px] font-semibold shadow-none focus-visible:border-[#007AFF] focus-visible:ring-[#007AFF]/20"
          />
          <div className="hidden items-center gap-1 px-1 text-[10px] text-muted-foreground sm:flex">
            {saveStatus === "saving" ? (
              <Icon icon={Loading03Icon} size={12} className="animate-spin" />
            ) : saveStatus === "unsaved" ? (
              <Icon icon={FloppyDiskIcon} size={12} />
            ) : (
              <Icon icon={CloudSavingDone01Icon} size={12} />
            )}
            <span>
              {saveStatus === "saving"
                ? "Saving..."
                : saveStatus === "unsaved"
                  ? "Edited just now"
                  : `Saved ${relativeTime(form.updatedAt)}`}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-0.5 rounded-[8px] bg-muted p-0.5">
        <button
          type="button"
          onClick={() => setMode("edit")}
          className={cn(
            "flex h-7 items-center gap-1 rounded-[7px] px-2.5 text-[11px] transition-all duration-150",
            mode === "edit"
              ? "bg-card text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
              : "text-muted-foreground"
          )}
        >
          <Icon icon={PencilEdit01Icon} size={14} />
          <span className="hidden sm:inline">Edit</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("preview");
            onEnterPreview();
          }}
          className={cn(
            "flex h-7 items-center gap-1 rounded-[7px] px-2.5 text-[11px] transition-all duration-150",
            mode === "preview"
              ? "bg-card text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
              : "text-muted-foreground"
          )}
        >
          <Icon icon={EyeIcon} size={14} />
          <span className="hidden sm:inline">Live preview</span>
        </button>
      </div>

      <div className="flex flex-1 items-center justify-end gap-1">
        <HeaderButton
          label="Undo"
          shortcut="⌘Z"
          disabled={!canUndo}
          onClick={() => useBuilderStore.temporal.getState().undo()}
        >
          <Icon icon={Undo02Icon} size={16} />
        </HeaderButton>
        <HeaderButton
          label="Redo"
          shortcut="⇧⌘Z"
          disabled={!canRedo}
          onClick={() => useBuilderStore.temporal.getState().redo()}
        >
          <Icon icon={Redo02Icon} size={16} />
        </HeaderButton>
        <HeaderButton label="Appearance" onClick={onOpenAppearance}>
          <Icon icon={PaletteIcon} size={16} />
        </HeaderButton>
        <HeaderButton
          label="Version history"
          onClick={() => setHistoryOpen(true)}
          className="hidden md:inline-flex"
        >
          <Icon icon={HistoryIcon} size={16} />
        </HeaderButton>
        <HeaderButton
          label="JSON schema"
          onClick={() => setSchemaOpen(true)}
          className="hidden lg:inline-flex"
        >
          <Icon icon={SourceCodeIcon} size={16} />
        </HeaderButton>
        <HeaderButton
          label={rightOpen ? "Collapse right sidebar" : "Open right sidebar"}
          onClick={onToggleRight}
        >
          <Icon
            icon={rightOpen ? PanelRightCloseIcon : PanelRightOpenIcon}
            size={15}
          />
        </HeaderButton>
        <ThemeToggle />
        <Button
          variant="outline"
          onClick={() => setShareOpen(true)}
          className="ml-1 h-7 px-2.5 text-[11px]"
        >
          <Icon icon={Share01Icon} size={14} />
          <span className="hidden xl:inline">Share</span>
        </Button>
        <Button
          onClick={() => setShareOpen(true)}
          className="h-7 rounded-[7px] bg-[#007AFF] px-2.5 text-[11px] text-white hover:bg-[#0071E3]"
        >
          <Icon icon={PlayIcon} size={14} />
          <span className="hidden sm:inline">Publish</span>
        </Button>
      </div>

      <VersionHistory open={historyOpen} onOpenChange={setHistoryOpen} />
      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} />
      <SchemaDialog open={schemaOpen} onOpenChange={setSchemaOpen} />
    </header>
  );
}
