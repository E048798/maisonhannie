"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  setValue: (v: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

export function Tabs({ value, onValueChange, defaultValue, className, children }: { value?: string; onValueChange?: (v: string) => void; defaultValue?: string; className?: string; children: React.ReactNode }) {
  const [internal, setInternal] = React.useState(defaultValue || "");
  const current = value ?? internal;
  const setValue = onValueChange ?? setInternal;
  return <div className={className}><TabsContext.Provider value={{ value: current, setValue }}>{children}</TabsContext.Provider></div>;
}

export function TabsList({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("inline-flex gap-2", className)}>{children}</div>;
}

export function TabsTrigger({ value, className, children }: { value: string; className?: string; children: React.ReactNode }) {
  const ctx = React.useContext<TabsContextValue | null>(TabsContext);
  if (!ctx) return null;
  const active = ctx.value === value;
  return (
    <button
      type="button"
      data-state={active ? "active" : "inactive"}
      className={cn("px-3 py-2 rounded-md", className)}
      onClick={() => ctx.setValue(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className, children }: { value: string; className?: string; children: React.ReactNode }) {
  const ctx = React.useContext<TabsContextValue | null>(TabsContext);
  if (!ctx) return null;
  if (ctx.value !== value) return null;
  return <div className={className}>{children}</div>;
}