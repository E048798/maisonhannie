import * as React from "react";
import { cn } from "@/lib/utils";

export function Switch({ checked, onCheckedChange, className }: { checked: boolean; onCheckedChange: (c: boolean) => void; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "inline-flex h-6 w-10 items-center rounded-full transition-colors",
        checked ? "bg-black" : "bg-black/20",
        className
      )}
    >
      <span
        className={cn(
          "h-5 w-5 rounded-full bg-white shadow transform transition-transform",
          checked ? "translate-x-5" : "translate-x-1"
        )}
      />
    </button>
  );
}