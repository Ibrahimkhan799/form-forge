"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Add01Icon,
  AnalyticsUpIcon,
  Copy01Icon,
  Delete02Icon,
  MoreHorizontalIcon,
  PencilEdit01Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { BrandMark } from "@/components/brand";
import { Icon } from "@/components/icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFormsStore } from "@/lib/store/forms-store";
import { relativeTime } from "@/lib/format";

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

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-black">
      <header className="flex h-14 items-center justify-between border-b border-[#E5E5EA] bg-white px-6 dark:border-white/10 dark:bg-[#1C1C1E]">
        <BrandMark />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            onClick={handleCreate}
            className="h-8 rounded-[8px] bg-[#007AFF] px-3 text-[13px] text-white hover:bg-[#0071E3]"
          >
            <Icon icon={Add01Icon} size={14} />
            New form
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-[28px] font-semibold tracking-tight text-[#1D1D1F] dark:text-white">
            Forms
          </h1>
          <p className="mt-1 text-[15px] text-[#86868B]">
            Design, preview, and publish beautiful forms.
          </p>
        </div>

        {!hasHydrated ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-44 animate-pulse rounded-xl bg-white ring-1 ring-[#E5E5EA] dark:bg-[#1C1C1E] dark:ring-white/10"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button
              type="button"
              onClick={handleCreate}
              className="flex min-h-44 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#D2D2D7] bg-white text-[#86868B] transition-colors duration-150 hover:border-[#007AFF] hover:text-[#007AFF] dark:border-white/15 dark:bg-[#1C1C1E]"
            >
              <Icon icon={Add01Icon} size={22} />
              <span className="text-[15px]">Create a form</span>
            </button>
            {forms.map((form) => (
              <article
                key={form.id}
                className="group flex min-h-44 flex-col rounded-xl border border-[#E5E5EA] bg-white p-5 transition-all duration-150 hover:border-[#C7C7CC] dark:border-white/10 dark:bg-[#1C1C1E]"
              >
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/builder/${form.id}`} className="min-w-0">
                    <h2 className="truncate text-[15px] font-semibold text-[#1D1D1F] dark:text-white">
                      {form.title}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-[13px] text-[#86868B]">
                      {form.description || "No description"}
                    </p>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-[8px] text-[#86868B]"
                        />
                      }
                    >
                      <Icon icon={MoreHorizontalIcon} size={16} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/builder/${form.id}`)}>
                        <Icon icon={PencilEdit01Icon} size={14} />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/analytics/${form.id}`)}>
                        <Icon icon={AnalyticsUpIcon} size={14} />
                        Analytics
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
                        <Icon icon={Copy01Icon} size={14} />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => {
                          deleteForm(form.id);
                          toast.success("Form deleted");
                        }}
                      >
                        <Icon icon={Delete02Icon} size={14} />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-auto flex items-center justify-between pt-6 text-[12px] text-[#86868B]">
                  <span>
                    {form.fields.length} field{form.fields.length === 1 ? "" : "s"}
                  </span>
                  <span className={form.published ? "text-[#34C759]" : ""}>
                    {form.published ? "Published" : "Draft"}
                  </span>
                  <span>{relativeTime(form.updatedAt)}</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    className="h-8 flex-1 rounded-[8px] text-[13px]"
                    onClick={() => router.push(`/builder/${form.id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 flex-1 rounded-[8px] text-[13px]"
                    onClick={() => router.push(`/analytics/${form.id}`)}
                  >
                    Insights
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
