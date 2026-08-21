import { Add01Icon, Layers01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

export type LeftPanelView = "library" | "layers";

export function LeftPanelTabs({
  value,
  onChange,
}: {
  value: LeftPanelView;
  onChange: (value: LeftPanelView) => void;
}) {
  return (
    <div className="grid grid-cols-2 rounded-[8px] bg-muted p-0.5">
      {(
        [
          ["library", "Insert", Add01Icon],
          ["layers", "Layers", Layers01Icon],
        ] as const
      ).map(([id, label, icon]) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "flex h-7 items-center justify-center gap-1 rounded-[7px] text-[10px] transition-colors",
            value === id
              ? "bg-card text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
              : "text-muted-foreground"
          )}
        >
          <Icon icon={icon} size={12} />
          {label}
        </button>
      ))}
    </div>
  );
}
