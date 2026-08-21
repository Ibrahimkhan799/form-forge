"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, subDays } from "date-fns";
import {
  ArrowLeft01Icon,
  Download04Icon,
  FilterHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { BrandMark } from "@/components/brand";
import { Icon } from "@/components/icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFormsStore } from "@/lib/store/forms-store";
import { useSubmissionsStore } from "@/lib/store/submissions-store";
import { downloadTextFile, formatDateTime, formatFieldValue, toCsv } from "@/lib/format";
import { cn } from "@/lib/utils";

export function AnalyticsDashboard({ formId }: { formId: string }) {
  const form = useFormsStore((state) => state.forms.find((item) => item.id === formId));
  const hasHydrated = useFormsStore((state) => state.hasHydrated);
  const submissionsHydrated = useSubmissionsStore((state) => state.hasHydrated);
  const allSubmissions = useSubmissionsStore((state) => state.submissions);
  const allVisits = useSubmissionsStore((state) => state.visits);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const ready = hasHydrated && submissionsHydrated;
  const submissions = useMemo(
    () => allSubmissions.filter((item) => item.formId === formId),
    [allSubmissions, formId]
  );
  const visits = useMemo(
    () => allVisits.filter((item) => item.formId === formId),
    [allVisits, formId]
  );

  const chartData = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, index) => {
      const date = subDays(new Date(), 13 - index);
      const key = format(date, "yyyy-MM-dd");
      return {
        key,
        label: format(date, "MMM d"),
        responses: submissions.filter((item) => item.submittedAt.startsWith(key)).length,
      };
    });
    return days;
  }, [submissions]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = needle
      ? submissions.filter((item) =>
          JSON.stringify(item.data).toLowerCase().includes(needle)
        )
      : submissions;
    return [...rows].sort((a, b) =>
      sort === "newest"
        ? b.submittedAt.localeCompare(a.submittedAt)
        : a.submittedAt.localeCompare(b.submittedAt)
    );
  }, [query, sort, submissions]);

  const completionRate =
    visits.length === 0 ? 0 : Math.round((submissions.length / visits.length) * 100);

  function exportCsv() {
    if (!form) return;
    const header = ["Submitted at", ...form.fields.map((field) => field.label)];
    const rows = submissions.map((item) => [
      formatDateTime(item.submittedAt),
      ...form.fields.map((field) => formatFieldValue(item.data[field.id])),
    ]);
    downloadTextFile(
      `${form.title || "responses"}.csv`,
      toCsv([header, ...rows]),
      "text/csv"
    );
  }

  if (ready && !form) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#FBFBFD] text-[#86868B]">
        This form could not be found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-black">
      <header className="flex h-14 items-center justify-between border-b border-[#E5E5EA] bg-white px-6 dark:border-white/10 dark:bg-[#1C1C1E]">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="grid size-8 place-items-center rounded-[8px] hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Back to dashboard"
          >
            <Icon icon={ArrowLeft01Icon} size={18} />
          </Link>
          <BrandMark />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {form ? (
            <Link
              href={`/builder/${form.id}`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-8 rounded-[8px] text-[13px]"
              )}
            >
              Edit form
            </Link>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="text-[13px] text-[#86868B]">Analytics</p>
          <h1 className="mt-1 text-[28px] font-semibold tracking-tight text-[#1D1D1F] dark:text-white">
            {form?.title || "Loading..."}
          </h1>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total responses", value: submissions.length },
            { label: "Visits", value: visits.length },
            { label: "Completion rate", value: `${completionRate}%` },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-[#E5E5EA] bg-white px-5 py-4 dark:border-white/10 dark:bg-[#1C1C1E]"
            >
              <p className="text-[13px] text-[#86868B]">{stat.label}</p>
              <p className="mt-2 text-[28px] font-semibold tracking-tight text-[#1D1D1F] dark:text-white">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mb-6 rounded-xl border border-[#E5E5EA] bg-white p-5 dark:border-white/10 dark:bg-[#1C1C1E]">
          <p className="mb-4 text-[13px] text-[#86868B]">Submissions over time</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="ffFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#007AFF" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#007AFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E5E5EA" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#86868B", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: "#86868B", fontSize: 12 }} axisLine={false} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E5E5EA",
                    fontSize: 13,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="responses"
                  stroke="#007AFF"
                  strokeWidth={2}
                  fill="url(#ffFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E5EA] bg-white dark:border-white/10 dark:bg-[#1C1C1E]">
          <div className="flex flex-wrap items-center gap-3 border-b border-[#E5E5EA] px-5 py-4 dark:border-white/10">
            <div className="relative min-w-56 flex-1">
              <Icon
                icon={FilterHorizontalIcon}
                size={14}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#86868B]"
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter responses"
                className="h-9 rounded-xl pl-9 text-[13px]"
              />
            </div>
            <div className="flex rounded-xl bg-[#F5F5F7] p-1 dark:bg-white/10">
              {(["newest", "oldest"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSort(value)}
                  className={cn(
                    "h-7 rounded-[8px] px-3 text-[13px] capitalize transition-all duration-150",
                    sort === value
                      ? "bg-white text-[#1D1D1F] shadow-sm dark:bg-[#2C2C2E] dark:text-white"
                      : "text-[#86868B]"
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              className="h-8 rounded-[8px] text-[13px]"
              onClick={exportCsv}
            >
              <Icon icon={Download04Icon} size={14} />
              Export CSV
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[13px]">
              <thead className="text-[#86868B]">
                <tr className="border-b border-[#E5E5EA] dark:border-white/10">
                  <th className="px-5 py-3 font-normal">Submitted</th>
                  {form?.fields.map((field) => (
                    <th key={field.id} className="px-5 py-3 font-normal">
                      {field.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={(form?.fields.length ?? 0) + 1}
                      className="px-5 py-10 text-center text-[#86868B]"
                    >
                      No responses yet.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-[#E5E5EA] last:border-0 dark:border-white/10"
                    >
                      <td className="px-5 py-3 whitespace-nowrap text-[#86868B]">
                        {formatDateTime(item.submittedAt)}
                      </td>
                      {form?.fields.map((field) => (
                        <td key={field.id} className="px-5 py-3 text-[#1D1D1F] dark:text-white">
                          {formatFieldValue(item.data[field.id])}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
