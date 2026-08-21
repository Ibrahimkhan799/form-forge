import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="flex size-6 flex-col justify-center gap-[3px]" aria-hidden>
        <span className="h-[3px] w-5 rounded-full bg-[#007AFF]" />
        <span className="h-[3px] w-4 rounded-full bg-[#007AFF]/65" />
        <span className="h-[3px] w-3 rounded-full bg-[#007AFF]/35" />
      </span>
      <span className="text-[14px] font-semibold tracking-[-0.02em] text-foreground">
        FormForge
      </span>
    </div>
  );
}
