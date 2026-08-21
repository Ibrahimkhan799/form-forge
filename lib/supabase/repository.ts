"use client";

import { ensureSupabaseUser, getSupabaseClient } from "@/lib/supabase/client";
import { normalizeFormDocument } from "@/lib/constants";
import type {
  FormDocument,
  FormSubmission,
  FormVisit,
} from "@/lib/types";

export async function fetchOwnedForms() {
  const supabase = getSupabaseClient();
  const user = await ensureSupabaseUser();
  if (!supabase || !user) return [];

  const { data, error } = await supabase
    .from("forms")
    .select("document")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) =>
    normalizeFormDocument(row.document as FormDocument)
  );
}

export async function fetchPublishedForm(id: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return undefined;
  await ensureSupabaseUser();

  const { data, error } = await supabase
    .from("forms")
    .select("document")
    .eq("id", id)
    .eq("published", true)
    .maybeSingle();
  if (error) throw error;
  return data?.document
    ? normalizeFormDocument(data.document as FormDocument)
    : undefined;
}

export async function persistForm(form: FormDocument) {
  const supabase = getSupabaseClient();
  const user = await ensureSupabaseUser();
  if (!supabase || !user) return;

  const { error } = await supabase.from("forms").upsert({
    id: form.id,
    owner_id: user.id,
    title: form.title,
    published: form.published,
    document: form,
    created_at: form.createdAt,
    updated_at: form.updatedAt,
  });
  if (error) throw error;
}

export async function removeForm(id: string) {
  const supabase = getSupabaseClient();
  const user = await ensureSupabaseUser();
  if (!supabase || !user) return;
  const { error } = await supabase
    .from("forms")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);
  if (error) throw error;
}

export async function persistSubmission(submission: FormSubmission) {
  const supabase = getSupabaseClient();
  const user = await ensureSupabaseUser();
  if (!supabase || !user) return;
  const { error } = await supabase.from("submissions").insert({
    id: submission.id,
    form_id: submission.formId,
    submitter_id: user.id,
    payload: submission.data,
    completed: submission.completed,
    submitted_at: submission.submittedAt,
  });
  if (error) throw error;
}

export async function persistVisit(visit: FormVisit) {
  const supabase = getSupabaseClient();
  const user = await ensureSupabaseUser();
  if (!supabase || !user) return;
  const { error } = await supabase.from("form_visits").insert({
    id: visit.id,
    form_id: visit.formId,
    visitor_id: user.id,
    visited_at: visit.visitedAt,
  });
  if (error) throw error;
}

export async function fetchFormResponses(formId: string) {
  const supabase = getSupabaseClient();
  const user = await ensureSupabaseUser();
  if (!supabase || !user) {
    return { submissions: [] as FormSubmission[], visits: [] as FormVisit[] };
  }

  const [submissionsResult, visitsResult] = await Promise.all([
    supabase
      .from("submissions")
      .select("id, form_id, payload, completed, submitted_at")
      .eq("form_id", formId)
      .order("submitted_at", { ascending: false }),
    supabase
      .from("form_visits")
      .select("id, form_id, visited_at")
      .eq("form_id", formId)
      .order("visited_at", { ascending: false }),
  ]);
  if (submissionsResult.error) throw submissionsResult.error;
  if (visitsResult.error) throw visitsResult.error;

  return {
    submissions: (submissionsResult.data ?? []).map((row) => ({
      id: row.id,
      formId: row.form_id,
      data: row.payload as Record<string, unknown>,
      completed: row.completed,
      submittedAt: row.submitted_at,
    })),
    visits: (visitsResult.data ?? []).map((row) => ({
      id: row.id,
      formId: row.form_id,
      visitedAt: row.visited_at,
    })),
  };
}
