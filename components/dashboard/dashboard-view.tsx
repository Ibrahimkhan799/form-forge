"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Add01Icon,
  AnalyticsUpIcon,
  ArrowRight01Icon,
  Copy01Icon,
  Delete02Icon,
  MoreHorizontalIcon,
  PencilEdit01Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { Icon } from "@/components/icon";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFormsStore } from "@/lib/store/forms-store";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export function DashboardView() {
  const router = useRouter();
  const forms = useFormsStore((state) => state.forms);
  const hasHydrated = useFormsStore((state) => state.hasHydrated);
  const createForm = useFormsStore((state) => state.createForm);
  const deleteForm = useFormsStore((state) => state.deleteForm);
  const duplicateForm = useFormsStore((state) => state.duplicateForm);

  function handleCreate() {
    const form = createForm("Untitled form");
    router.push(`/builder/${form.id}`);
  }

  const published = forms.filter((form) => form.published).length;

  return (
    <WorkspaceShell
      active="forms"
      eyebrow="Workspace"
      title="Forms"
      description="Build, publish, and understand every response."
      actions={
        <Button onClick={handleCreate} className="h-8 px-3 text-[12px]">
          <Icon icon={Add01Icon} size={13} />
          New form
        </Button>
      }
    >
      <section className="mb-5 grid grid-cols-3 divide-x divide-border/70 rounded-[10px] border border-border/80 bg-card">
        {[
          { label: "Total", value: forms.length },
          { label: "Published", value: published },
          { label: "Drafts", value: forms.length - published },
        ].map((stat) => (
          <div key={stat.label} className="px-4 py-3">
            <p className="text-[10px] font-medium text-muted-foreground">{stat.label}</p>
            <p className="mt-0.5 text-[18px] font-semibold tracking-tight">{stat.value}</p>
          </div>
        ))}
      </section>

      <div className="mb-2 flex items-center justify-between px-1">
        <p className="text-[11px] font-medium text-muted-foreground">Recent forms</p>
        <p className="text-[10px] text-muted-foreground">Updated automatically</p>
      </div>

      {!hasHydrated ? (
        <div className="overflow-hidden rounded-[10px] border border-border/80 bg-card">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-[68px] animate-pulse border-b border-border/60 bg-muted/35 last:border-0"
            />
          ))}
        </div>
      ) : forms.length === 0 ? (
        <button
          type="button"
          onClick={handleCreate}
          className="flex w-full items-center justify-between rounded-[10px] border border-dashed border-border bg-card px-4 py-5 text-left transition-colors hover:border-[#007AFF]/50 hover:bg-[#007AFF]/[0.02]"
        >
          <span>
            <span className="block text-[13px] font-medium">Create your first form</span>
            <span className="mt-0.5 block text-[11px] text-muted-foreground">
              Start with a blank canvas and add fields as you go.
            </span>
          </span>
          <Icon icon={ArrowRight01Icon} size={15} className="text-muted-foreground" />
        </button>
      ) : (
        <section className="overflow-hidden rounded-[10px] border border-border/80 bg-card">
          {forms.map((form) => (
            <article
              key={form.id}
              className="group grid min-h-[68px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border/65 px-3 transition-colors last:border-0 hover:bg-muted/35 sm:grid-cols-[minmax(0,1fr)_110px_110px_32px]"
            >
              <Link
                href={`/builder/${form.id}`}
                className="flex min-w-0 items-center gap-3 py-3"
              >
                <span
                  className={cn(
                    "h-8 w-1 shrink-0 rounded-full",
                    form.published ? "bg-[#34C759]" : "bg-border"
                  )}
                />
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-medium">
                    {form.title}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                    {form.description || "No description"}
                  </span>
                </span>
              </Link>

              <div className="hidden sm:block">
                <p className="text-[11px]">{form.fields.length} layers</p>
                <p className="text-[10px] text-muted-foreground">
                  {form.displayMode === "classic" ? "All at once" : "One at a time"}
                </p>
              </div>

              <div className="hidden sm:block">
                <p
                  className={cn(
                    "text-[11px]",
                    form.published ? "text-[#248A3D]" : "text-muted-foreground"
                  )}
                >
                  {form.published ? "Published" : "Draft"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {relativeTime(form.updatedAt)}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground opacity-70 group-hover:opacity-100"
                    />
                  }
                >
                  <Icon icon={MoreHorizontalIcon} size={14} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/builder/${form.id}`)}>
                    <Icon icon={PencilEdit01Icon} size={13} />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/analytics/${form.id}`)}>
                    <Icon icon={AnalyticsUpIcon} size={13} />
                    Insights
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      const copy = duplicateForm(form.id);
                      if (copy) {
                        toast.success("Form duplicated");
                        router.push(`/builder/${copy.id}`);
                      }
                    }}
                  >
                    <Icon icon={Copy01Icon} size={13} />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => {
                      deleteForm(form.id);
                      toast.success("Form deleted");
                    }}
                  >
                    <Icon icon={Delete02Icon} size={13} />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </article>
          ))}
        </section>
      )}
    </WorkspaceShell>
  );
}
