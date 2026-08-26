"use client";

import { useEffect, useMemo, useState } from "react";
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
  Download04Icon,
  Edit02Icon,
  FilterHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/icon";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFormsStore } from "@/lib/store/forms-store";
import { useSubmissionsStore } from "@/lib/store/submissions-store";
import { downloadTextFile, formatDateTime, formatFieldValue, toCsv } from "@/lib/format";
import { cn } from "@/lib/utils";
import { isInputFieldType } from "@/lib/types";

export function AnalyticsDashboard({ formId }: { formId: string }) {
  const form = useFormsStore((state) => state.forms.find((item) => item.id === formId));
  const hasHydrated = useFormsStore((state) => state.hasHydrated);
  const submissionsHydrated = useSubmissionsStore((state) => state.hasHydrated);
  const allSubmissions = useSubmissionsStore((state) => state.submissions);
  const allVisits = useSubmissionsStore((state) => state.visits);
  const syncFormResponses = useSubmissionsStore(
    (state) => state.syncFormResponses
  );
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const ready = hasHydrated && submissionsHydrated;

  useEffect(() => {
    void syncFormResponses(formId);
  }, [formId, syncFormResponses]);
  const submissions = useMemo(
    () => allSubmissions.filter((item) => item.formId === formId),
    [allSubmissions, formId]
  );
  const visits = useMemo(
    () => allVisits.filter((item) => item.formId === formId),
    [allVisits, formId]
  );

  const chartData = useMemo(
    () =>
      Array.from({ length: 14 }, (_, index) => {
        const date = subDays(new Date(), 13 - index);
        const key = format(date, "yyyy-MM-dd");
        return {
          key,
          label: format(date, "MMM d"),
          responses: submissions.filter((item) => item.submittedAt.startsWith(key)).length,
        };
      }),
    [submissions]
  );

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
    const inputFields = form.fields.filter((field) => isInputFieldType(field.type));
    const header = ["Submitted at", ...inputFields.map((field) => field.label)];
    const rows = submissions.map((item) => [
      formatDateTime(item.submittedAt),
      ...inputFields.map((field) => formatFieldValue(item.data[field.id])),
    ]);
    downloadTextFile(
      `${form.title || "responses"}.csv`,
      toCsv([header, ...rows]),
      "text/csv"
    );
  }

  if (ready && !form) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background text-[12px] text-muted-foreground">
        This form could not be found.
      </div>
    );
  }

  return (
    <WorkspaceShell
      active="analytics"
      formId={formId}
      eyebrow="Insights"
      title={form?.title || "Loading…"}
      description="Response activity and completion health."
      actions={
        form ? (
          <Link
            href={`/builder/${form.id}`}
            className={cn(buttonVariants({ variant: "outline" }), "h-8 text-[12px]")}
          >
            <Icon icon={Edit02Icon} size={13} />
            Edit form
          </Link>
        ) : null
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <section className="rounded-[10px] border border-border/80 bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[12px] font-medium">Response activity</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Last 14 days</p>
            </div>
            <span className="rounded-full bg-[#007AFF]/8 px-2 py-1 text-[10px] font-medium text-[#007AFF]">
              {submissions.length} total
            </span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 4, bottom: 0, left: -24 }}>
                <defs>
                  <linearGradient id="ffFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#007AFF" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#007AFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#86868B", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={24}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#86868B", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip
                  cursor={{ stroke: "#007AFF", strokeOpacity: 0.2 }}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--popover)",
                    color: "var(--popover-foreground)",
                    fontSize: 11,
                    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="responses"
                  stroke="#007AFF"
                  strokeWidth={1.5}
                  fill="url(#ffFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <aside className="overflow-hidden rounded-[10px] border border-border/80 bg-card">
          <div className="border-b border-border/70 px-4 py-3">
            <p className="text-[12px] font-medium">Response health</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Live browser data</p>
          </div>
          {[
            { label: "Responses", value: submissions.length, detail: "Completed forms" },
            { label: "Visits", value: visits.length, detail: "Public form opens" },
            {
              label: "Completion",
              value: `${completionRate}%`,
              detail: "Responses ÷ visits",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-between border-b border-border/60 px-4 py-3 last:border-0"
            >
              <div>
                <p className="text-[11px] font-medium">{stat.label}</p>
                <p className="text-[10px] text-muted-foreground">{stat.detail}</p>
              </div>
              <p className="text-[18px] font-semibold tracking-tight">{stat.value}</p>
            </div>
          ))}
        </aside>
      </div>

      <section className="mt-4 overflow-hidden rounded-[10px] border border-border/80 bg-card">
        <div className="flex flex-wrap items-center gap-2 border-b border-border/70 p-3">
          <div className="relative min-w-52 flex-1">
            <Icon
              icon={FilterHorizontalIcon}
              size={13}
              className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter responses"
              className="h-8 pl-8 text-[11px]"
            />
          </div>
          <div className="flex rounded-[8px] bg-muted p-0.5">
            {(["newest", "oldest"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setSort(value)}
                className={cn(
                  "h-7 rounded-[6px] px-2.5 text-[10px] capitalize transition-colors",
                  sort === value
                    ? "bg-card text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                    : "text-muted-foreground"
                )}
              >
                {value}
              </button>
            ))}
          </div>
          <Button variant="outline" className="h-8 text-[11px]" onClick={exportCsv}>
            <Icon icon={Download04Icon} size={13} />
            Export
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[11px]">
            <thead className="bg-muted/45 text-muted-foreground">
              <tr className="border-b border-border/70">
                <th className="px-4 py-2 font-medium">Submitted</th>
                {form?.fields
                  .filter((field) => isInputFieldType(field.type))
                  .map((field) => (
                  <th key={field.id} className="px-4 py-2 font-medium">
                    {field.label}
                  </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      (form?.fields.filter((field) => isInputFieldType(field.type))
                        .length ?? 0) + 1
                    }
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    No responses yet.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border/55 transition-colors last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                      {formatDateTime(item.submittedAt)}
                    </td>
                    {form?.fields
                      .filter((field) => isInputFieldType(field.type))
                      .map((field) => (
                      <td key={field.id} className="max-w-52 truncate px-4 py-2.5">
                        {formatFieldValue(item.data[field.id])}
                      </td>
                      ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </WorkspaceShell>
  );
}
