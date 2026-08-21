import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="grid size-7 place-items-center rounded-[8px] bg-[#007AFF] text-[13px] font-semibold text-white">
        F
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-[#1D1D1F] dark:text-white">
        FormForge
      </span>
    </div>
  );
}
