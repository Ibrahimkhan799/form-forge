"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import {
  isInputFieldType,
  type FormButtonStyle,
  type FormDocument,
  type FormWidth,
} from "@/lib/types";
import { buildDefaultValues, buildZodSchema } from "@/lib/schema/zod-generator";
import { themeToStyle } from "@/lib/theme";
import { Icon } from "@/components/icon";
import { FieldInput } from "@/components/renderer/field-input";
import { ComponentFrame, ShowcaseField } from "@/components/fields/showcase-field";
import { GoogleFontLoader } from "@/components/fonts/google-font-loader";
import { useSubmissionsStore } from "@/lib/store/submissions-store";
import { cn } from "@/lib/utils";
import { sanitizeRichText } from "@/lib/rich-text";

export function FormPlayer({
  form,
  preview = false,
}: {
  form: FormDocument;
  preview?: boolean;
}) {
  const recordVisit = useSubmissionsStore((state) => state.recordVisit);

  useEffect(() => {
    if (!preview) recordVisit(form.id);
  }, [form.id, preview, recordVisit]);

  return (
    <>
      <GoogleFontLoader
        families={[form.theme.bodyFontFamily, form.theme.headingFontFamily]}
      />
      {form.displayMode === "classic" ? (
        <ClassicForm form={form} preview={preview} />
      ) : (
        <ConversationalForm form={form} preview={preview} />
      )}
    </>
  );
}

function useDynamicForm(form: FormDocument) {
  const schema = useMemo(() => buildZodSchema(form.fields), [form.fields]);
  return useForm<Record<string, unknown>>({
    resolver: zodResolver(schema),
    defaultValues: buildDefaultValues(form.fields) as Record<string, unknown>,
    mode: "onSubmit",
  });
}

function formSurfaceStyle(form: FormDocument) {
  const background =
    form.theme.backgroundStyle === "gradient"
      ? `radial-gradient(1200px 600px at 50% -10%, color-mix(in srgb, ${form.theme.primaryColor} 18%, white), ${form.theme.backgroundColor})`
      : form.theme.backgroundColor;

  return {
    ...themeToStyle(form.theme),
    background,
    color: form.theme.textColor,
  };
}

const FORM_WIDTH_CLASS: Record<FormWidth, string> = {
  narrow: "max-w-lg",
  standard: "max-w-2xl",
  wide: "max-w-4xl",
};

function ConversationalForm({
  form,
  preview,
}: {
  form: FormDocument;
  preview: boolean;
}) {
  const methods = useDynamicForm(form);
  const addSubmission = useSubmissionsStore((state) => state.addSubmission);
  const [step, setStep] = useState(-1);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Enter" || event.shiftKey || step !== -1) return;
      event.preventDefault();
      setDirection(1);
      setStep(0);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [step]);

  const field = step >= 0 && step < form.fields.length ? form.fields[step] : null;
  const isWelcome = step === -1;
  const isThanks = step >= form.fields.length;
  const questionCount = form.fields.filter((item) =>
    isInputFieldType(item.type)
  ).length;
  const progress =
    isWelcome || isThanks
      ? isThanks
        ? 100
        : 0
      : ((step + 1) / form.fields.length) * 100;

  async function goNext() {
    if (field && isInputFieldType(field.type)) {
      const valid = await methods.trigger(field.id);
      if (!valid) return;
    }
    setDirection(1);
    setStep((current) => current + 1);
    if (step === form.fields.length - 1 && !preview) {
      addSubmission(form.id, methods.getValues());
    }
  }

  function restart() {
    methods.reset(buildDefaultValues(form.fields) as Record<string, unknown>);
    setDirection(-1);
    setStep(-1);
  }

  return (
    <div
      className={cn(
        "form-surface relative flex h-full min-h-0 flex-col overflow-hidden",
        form.theme.backgroundStyle === "dots" && "form-dots"
      )}
      style={formSurfaceStyle(form)}
    >
      <div className="h-1 shrink-0 bg-black/5">
        <div
          className="h-full transition-all duration-200 ease-in-out"
          style={{ width: `${progress}%`, background: form.theme.primaryColor }}
        />
      </div>
      <div
        className={cn(
          "mx-auto flex w-full flex-1 flex-col justify-center overflow-y-auto px-8 py-10",
          FORM_WIDTH_CLASS[form.theme.width]
        )}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={isWelcome ? "welcome" : isThanks ? "thanks" : field?.id}
            custom={direction}
            initial={{ opacity: 0, y: direction > 0 ? 14 : -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: direction > 0 ? -14 : 14 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
          >
            {isWelcome ? (
              <div>
                <p className="text-[13px] text-[#86868B]">
                  {questionCount} question{questionCount === 1 ? "" : "s"}
                </p>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight">{form.title}</h1>
                {form.description ? (
                  <p className="mt-3 max-w-lg text-[15px] leading-6 text-[#86868B]">
                    {form.description}
                  </p>
                ) : null}
                <PrimaryButton
                  color={form.theme.primaryColor}
                  buttonStyle={form.theme.buttonStyle}
                  onClick={goNext}
                  className="mt-8"
                >
                  Start
                  <Icon icon={ArrowRight01Icon} size={16} />
                </PrimaryButton>
                <p className="mt-3 text-[12px] text-[#86868B]">Press Enter ↵</p>
              </div>
            ) : null}

            {field ? (
              <div>
                {isInputFieldType(field.type) ? (
                  <>
                    <p className="text-[13px] text-[#86868B]">
                      {step + 1} of {form.fields.length}
                      {field.required ? " · Required" : ""}
                    </p>
                    <ComponentFrame field={field}>
                      <h2 className="ff-heading mt-3 text-3xl font-semibold tracking-tight">
                        {field.label}
                      </h2>
                      {field.helpText ? (
                        <p className="mt-2 text-[15px] text-[#86868B]">
                          {field.helpText}
                        </p>
                      ) : null}
                      <div className="mt-6">
                        <FieldInput
                          field={field}
                          control={methods.control}
                          autoFocus
                          onEnter={goNext}
                        />
                      </div>
                    </ComponentFrame>
                  </>
                ) : (
                  <ShowcaseField field={field} />
                )}
                <div className="mt-6 flex items-center gap-3">
                  <PrimaryButton
                    color={form.theme.primaryColor}
                    buttonStyle={form.theme.buttonStyle}
                    onClick={goNext}
                  >
                    {step === form.fields.length - 1
                      ? "Submit"
                      : isInputFieldType(field.type)
                        ? "OK"
                        : "Continue"}
                    <Icon icon={Tick02Icon} size={16} />
                  </PrimaryButton>
                  <button
                    type="button"
                    onClick={() => {
                      setDirection(-1);
                      setStep((current) => Math.max(-1, current - 1));
                    }}
                    className="h-11 rounded-[8px] px-3 text-[13px] text-[#86868B] hover:text-[#1D1D1F]"
                  >
                    Back
                  </button>
                </div>
                <p className="mt-3 text-[12px] text-[#86868B]">Press Enter ↵</p>
              </div>
            ) : null}

            {isThanks ? (
              <ConfirmationView form={form} onRestart={restart} />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function ClassicForm({
  form,
  preview,
}: {
  form: FormDocument;
  preview: boolean;
}) {
  const methods = useDynamicForm(form);
  const addSubmission = useSubmissionsStore((state) => state.addSubmission);
  const [submitted, setSubmitted] = useState(false);

  const submit = methods.handleSubmit((values) => {
    if (!preview) addSubmission(form.id, values);
    setSubmitted(true);
  });

  function restart() {
    methods.reset(buildDefaultValues(form.fields) as Record<string, unknown>);
    setSubmitted(false);
  }

  return (
    <div
      className={cn(
        "form-surface h-full overflow-y-auto overscroll-contain",
        form.theme.backgroundStyle === "dots" && "form-dots"
      )}
      style={formSurfaceStyle(form)}
    >
      <div
        className={cn(
          "mx-auto w-full px-6 py-10 sm:py-14",
          FORM_WIDTH_CLASS[form.theme.width]
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="rounded-[calc(var(--ff-radius)+4px)] border border-black/8 bg-[var(--ff-surface)] p-6 sm:p-8"
        >
          {submitted ? (
            <ConfirmationView form={form} onRestart={restart} />
          ) : (
            <form onSubmit={submit}>
              <p className="text-[12px] text-[#86868B]">FormForge form</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">{form.title}</h1>
              {form.description ? (
                <p className="mt-2 text-[15px] leading-6 text-[#86868B]">{form.description}</p>
              ) : null}
              <div className="mt-8 space-y-[var(--ff-field-gap)]">
                {form.fields.map((field) => (
                  <div key={field.id}>
                    {isInputFieldType(field.type) ? (
                      <ComponentFrame field={field}>
                        <label className="ff-heading mb-2 block text-[15px] font-medium">
                          {field.label}
                          {field.required ? (
                            <span className="ml-1 text-[var(--ff-primary)]">*</span>
                          ) : null}
                        </label>
                        {field.helpText ? (
                          <p className="mb-3 text-[13px] text-[#86868B]">
                            {field.helpText}
                          </p>
                        ) : null}
                        <FieldInput field={field} control={methods.control} />
                      </ComponentFrame>
                    ) : (
                      <ShowcaseField field={field} />
                    )}
                  </div>
                ))}
              </div>
              <PrimaryButton
                color={form.theme.primaryColor}
                buttonStyle={form.theme.buttonStyle}
                type="submit"
                className="mt-8"
              >
                Submit
                <Icon icon={ArrowRight01Icon} size={16} />
              </PrimaryButton>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function ConfirmationView({
  form,
  onRestart,
}: {
  form: FormDocument;
  onRestart: () => void;
}) {
  return (
    <div>
      <div
        className="mb-5 grid size-12 place-items-center rounded-full text-white"
        style={{ background: form.theme.primaryColor }}
      >
        <Icon icon={Tick02Icon} size={22} />
      </div>
      <h2 className="text-4xl font-semibold tracking-tight">{form.confirmation.title}</h2>
      <div
        className="rich-text-content mt-3 text-[15px] leading-6 text-[#86868B]"
        dangerouslySetInnerHTML={{
          __html: sanitizeRichText(form.confirmation.message),
        }}
      />
      <button
        type="button"
        onClick={onRestart}
        className="mt-7 text-[13px] font-medium text-[var(--ff-primary)]"
      >
        {form.confirmation.buttonLabel}
      </button>
    </div>
  );
}

function PrimaryButton({
  color,
  buttonStyle,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  color: string;
  buttonStyle: FormButtonStyle;
}) {
  const appearance =
    buttonStyle === "soft"
      ? {
          background: `color-mix(in srgb, ${color} 12%, transparent)`,
          color,
          border: "1px solid transparent",
        }
      : buttonStyle === "outline"
        ? {
            background: "transparent",
            color,
            border: `1px solid ${color}`,
          }
        : {
            background: color,
            color: "#FFFFFF",
            border: "1px solid transparent",
          };

  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-[8px] px-5 text-[15px] text-white transition-opacity duration-150 hover:opacity-90",
        className
      )}
      style={appearance}
      {...props}
    >
      {children}
    </button>
  );
}
