"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

type SheetContextValue = {
  open: boolean;
  setOpen: (o: boolean) => void;
};

const SheetContext = React.createContext<SheetContextValue | null>(null);

export function Sheet({ open, onOpenChange, children }: { open: boolean; onOpenChange: (o: boolean) => void; children: React.ReactNode }) {
  return <SheetContext.Provider value={{ open, setOpen: onOpenChange }}>{children}</SheetContext.Provider>;
}

export function SheetContent({ className, children }: { className?: string; children: React.ReactNode }) {
  const ctx = React.useContext(SheetContext);
  if (!ctx) return null;
  const { open, setOpen } = ctx;
  return (
    <div
      className={cn(
        "fixed inset-0 z-50",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={!open}
    >
      <div
        className={cn(
          "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={() => setOpen(false)}
      />
      <div
        className={cn(
          "absolute top-0 right-0 bottom-0 w-full sm:max-w-lg bg-white shadow-xl transition-transform",
          open ? "translate-x-0" : "translate-x-full",
          className
        )}
        role="dialog"
      >
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-4", className)}>{children}</div>;
}

export function SheetTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("text-lg font-semibold", className)}>{children}</div>;
}