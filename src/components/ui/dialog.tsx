"use client";
import * as React from "react";

const DialogContext = React.createContext<{ open: boolean; setOpen: (o: boolean) => void } | null>(null);

export function Dialog({ open: openProp, onOpenChange, children }: { open?: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode }) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? !!openProp : internalOpen;
  const setOpen = (o: boolean) => {
    if (!isControlled) setInternalOpen(o);
    onOpenChange?.(o);
  };
  return <DialogContext.Provider value={{ open, setOpen }}>{children}</DialogContext.Provider>;
}

export function DialogTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) {
  const ctx = React.useContext(DialogContext)!;
  if (asChild) {
    return (
      <span onClick={() => ctx.setOpen(true)} className="inline-flex">
        {children}
      </span>
    );
  }
  return (
    <button type="button" onClick={() => ctx.setOpen(true)} className="inline-flex items-center">
      {children}
    </button>
  );
}

export function DialogContent({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext(DialogContext)!;
  if (!ctx.open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => ctx.setOpen(false)} />
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow dark:bg-neutral-900">
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold text-black">{children}</h2>;
}

export function DialogDescription({ children }: { children: React.ReactNode }) {
      return <p className="text-sm text-black dark:text-neutral-300">{children}</p>;
}
