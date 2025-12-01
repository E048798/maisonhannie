"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

type SelectContextValue = {
  value: string;
  setValue: (v: string) => void;
  open: boolean;
  setOpen: (o: boolean) => void;
};

const SelectContext = React.createContext<SelectContextValue | null>(null);

export function Select({ value, onValueChange, children }: { value: string; onValueChange: (v: string) => void; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <SelectContext.Provider value={{ value, setValue: onValueChange, open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ className, children }: { className?: string; children?: React.ReactNode }) {
  const ctx = React.useContext<SelectContextValue | null>(SelectContext);
  if (!ctx) return null;
  return (
    <button
      type="button"
      className={cn(
        "border px-3 py-2 rounded-xl w-40 text-left bg-white border-[#D4AF37]/20 focus:border-[#D4AF37]",
        className
      )}
      onClick={() => ctx.setOpen(!ctx.open)}
    >
      {children}
    </button>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const ctx = React.useContext<SelectContextValue | null>(SelectContext);
  if (!ctx) return null;
  return <span>{ctx.value ? ctx.value : placeholder}</span>;
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext<SelectContextValue | null>(SelectContext);
  if (!ctx) return null;
  if (!ctx.open) return null;
  return <div className="absolute mt-2 z-10 min-w-[10rem] rounded-md border bg-white shadow-sm">{children}</div>;
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = React.useContext<SelectContextValue | null>(SelectContext);
  if (!ctx) return null;
  return (
    <div
      role="option"
      className="px-3 py-2 cursor-pointer hover:bg-black/5"
      onClick={() => {
        ctx.setValue(value);
        ctx.setOpen(false);
      }}
    >
      {children}
    </div>
  );
}