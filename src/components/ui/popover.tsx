"use client";
import * as React from "react";

type PopoverContextType = {
  open: boolean;
  setOpen: (v: boolean) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
};

const PopoverContext = React.createContext<PopoverContextType | null>(null);

export function Popover({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <PopoverContext.Provider value={{ open, setOpen, containerRef }}>
      <div ref={containerRef} className="relative inline-block">
        {children}
      </div>
    </PopoverContext.Provider>
  );
}

export function PopoverTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) {
  const ctx = React.useContext(PopoverContext);
  if (!ctx) return <>{children}</>;
  const { open, setOpen } = ctx;
  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(!open);
  };
  if (asChild && React.isValidElement(children)) {
    const el = children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>;
    const orig = el.props.onClick;
    return React.cloneElement(el, { onClick: (e: React.MouseEvent) => { orig?.(e); onClick(e); } });
  }
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center">
      {children}
    </button>
  );
}

export function PopoverContent({ children, align = "start" }: { children: React.ReactNode; align?: "start" | "end" | string }) {
  const ctx = React.useContext(PopoverContext);
  if (!ctx) return null;
  const { open } = ctx;
  if (!open) return null;
  return (
    <div className={`absolute z-50 mt-2 min-w-[240px] ${align === "end" ? "right-0" : "left-0"} rounded-md border border-neutral-200 bg-white p-3 shadow`}>{children}</div>
  );
}


