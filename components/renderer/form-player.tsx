"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import type { FormDocument } from "@/lib/types";
import { buildDefaultValues, buildZodSchema } from "@/lib/schema/zod-generator";
import { themeToStyle } from "@/lib/theme";
import { FONT_STACKS } from "@/lib/constants";
import { Icon } from "@/components/icon";
import { FieldInput } from "@/components/renderer/field-input";
import { useSubmissionsStore } from "@/lib/store/submissions-store";
import { cn } from "@/lib/utils";

export function FormPlayer({
  form,
  preview = false,
}: {
  form: FormDocument;
  preview?: boolean;
}) {
  const schema = useMemo(() => buildZodSchema(form.fields), [form.fields]);
  const methods = useForm<Record<string, unknown>>({
    resolver: zodResolver(schema),
    defaultValues: buildDefaultValues(form.fields) as Record<string, unknown>,
    mode: "onSubmit",
  });
  const recordVisit = useSubmissionsStore((state) => state.recordVisit);
  const addSubmission = useSubmissionsStore((state) => state.addSubmission);
  const [step, setStep] = useState(-1);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (!preview) recordVisit(form.id);
  }, [form.id, preview, recordVisit]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Enter" || event.shiftKey) return;
      if (step === -1) {
        event.preventDefault();
        setDirection(1);
        setStep(0);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [step]);

  const field = step >= 0 && step < form.fields.length ? form.fields[step] : null;
  const isWelcome = step === -1;
  const isThanks = step >= form.fields.length;
  const progress = isWelcome || isThanks ? (isThanks ? 100 : 0) : ((step + 1) / form.fields.length) * 100;

  async function goNext() {
    if (field) {
      const valid = await methods.trigger(field.id);
      if (!valid) return;
    }
    setDirection(1);
    setStep((current) => current + 1);
    if (step === form.fields.length - 1 && !preview) {
      addSubmission(form.id, methods.getValues());
    }
  }

  function goBack() {
    if (step < 0) return;
    setDirection(-1);
    setStep((current) => Math.max(-1, current - 1));
  }

  const background =
    form.theme.backgroundStyle === "gradient"
      ? `radial-gradient(1200px 600px at 50% -10%, color-mix(in srgb, ${form.theme.primaryColor} 18%, white), ${form.theme.backgroundColor})`
      : form.theme.backgroundColor;

  return (
    <div
      className={cn(
        "relative flex h-full min-h-0 flex-col",
        form.theme.backgroundStyle === "dots" && "canvas-dots"
      )}
      style={{
        ...themeToStyle(form.theme),
        background,
        color: form.theme.textColor,
        fontFamily: FONT_STACKS[form.theme.fontFamily],
      }}
    >
      <div className="h-1 bg-black/5">
        <div
          className="h-full transition-all duration-200 ease-in-out"
          style={{ width: `${progress}%`, background: form.theme.primaryColor }}
        />
      </div>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 py-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={isWelcome ? "welcome" : isThanks ? "thanks" : field?.id}
            custom={direction}
            initial={{ opacity: 0, y: direction > 0 ? 16 : -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: direction > 0 ? -16 : 16 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {isWelcome ? (
              <div>
                <p className="text-[13px] text-[#86868B]">
                  {form.fields.length} question{form.fields.length === 1 ? "" : "s"}
                </p>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight">{form.title}</h1>
                {form.description ? (
                  <p className="mt-3 max-w-lg text-[15px] leading-6 text-[#86868B]">
                    {form.description}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={goNext}
                  className="mt-8 inline-flex h-11 items-center gap-2 rounded-[8px] px-5 text-[15px] text-white transition-opacity duration-150 hover:opacity-90"
                  style={{ background: form.theme.primaryColor }}
                >
                  Start
                  <Icon icon={ArrowRight01Icon} size={16} />
                </button>
                <p className="mt-3 text-[13px] text-[#86868B]">press Enter ↵</p>
              </div>
            ) : null}

            {field ? (
              <div>
                <p className="text-[13px] text-[#86868B]">
                  {step + 1} of {form.fields.length}
                  {field.required ? " · Required" : ""}
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">{field.label}</h2>
                {field.helpText ? (
                  <p className="mt-2 text-[15px] text-[#86868B]">{field.helpText}</p>
                ) : null}
                <div className="mt-6">
                  <FieldInput
                    field={field}
                    control={methods.control}
                    autoFocus
                    onEnter={goNext}
                  />
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex h-11 items-center gap-2 rounded-[8px] px-5 text-[15px] text-white transition-opacity duration-150 hover:opacity-90"
                    style={{ background: form.theme.primaryColor }}
                  >
                    {step === form.fields.length - 1 ? "Submit" : "OK"}
                    <Icon icon={Tick02Icon} size={16} />
                  </button>
                  {step > 0 || !isWelcome ? (
                    <button
                      type="button"
                      onClick={goBack}
                      className="h-11 rounded-[8px] px-3 text-[13px] text-[#86868B] transition-colors duration-150 hover:text-[#1D1D1F]"
                    >
                      Back
                    </button>
                  ) : null}
                </div>
                <p className="mt-3 text-[13px] text-[#86868B]">press Enter ↵</p>
              </div>
            ) : null}

            {isThanks ? (
              <div>
                <div
                  className="mb-5 grid size-12 place-items-center rounded-full text-white"
                  style={{ background: form.theme.primaryColor }}
                >
                  <Icon icon={Tick02Icon} size={22} />
                </div>
                <h2 className="text-4xl font-semibold tracking-tight">Thank you</h2>
                <p className="mt-3 text-[15px] text-[#86868B]">
                  {preview
                    ? "This is the confirmation screen respondents will see."
                    : "Your response has been recorded."}
                </p>
                {preview ? (
                  <button
                    type="button"
                    onClick={() => {
                      methods.reset(buildDefaultValues(form.fields) as Record<string, unknown>);
                      setStep(-1);
                    }}
                    className="mt-8 text-[13px] text-[#007AFF]"
                  >
                    Restart preview
                  </button>
                ) : null}
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
