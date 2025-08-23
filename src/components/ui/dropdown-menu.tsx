"use client";
import * as React from "react";

type MenuContextType = {
  open: boolean;
  setOpen: (v: boolean) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
};

const MenuContext = React.createContext<MenuContextType | null>(null);

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
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
    <MenuContext.Provider value={{ open, setOpen, containerRef }}>
      <div ref={containerRef} className="relative inline-block">
        {children}
      </div>
    </MenuContext.Provider>
  );
}

export function DropdownMenuTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) {
  const ctx = React.useContext(MenuContext);
  if (!ctx) return <>{children}</>;
  const { open, setOpen } = ctx;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(!open);
  };

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>;
    const origOnClick = child.props.onClick;
    return React.cloneElement(child, {
      onClick: (e: React.MouseEvent) => {
        origOnClick?.(e);
        handleClick(e);
      },
    });
  }
  return (
    <button type="button" onClick={handleClick} className="inline-flex items-center">
      {children}
    </button>
  );
}

export function DropdownMenuContent({ children, align }: { children: React.ReactNode; align?: "start" | "end" | string }) {
  const ctx = React.useContext(MenuContext);
  if (!ctx) return null;
  const { open } = ctx;
  if (!open) return null;
  return (
    <div
      className={`absolute z-50 mt-2 min-w-[160px] ${align === "end" ? "right-0" : "left-0"} rounded-md border border-neutral-200 bg-white text-neutral-900 shadow dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

export function DropdownMenuLabel({ children }: { children: React.ReactNode }) {
      return <div className="px-3 py-2 text-xs font-medium text-black dark:text-neutral-300">{children}</div>;
}

export function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-neutral-200 dark:bg-neutral-700" />;
}

export function DropdownMenuItem({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  const ctx = React.useContext(MenuContext);
  const handle = () => {
    onClick?.();
    ctx?.setOpen(false);
  };
  return (
    <button
      onClick={handle}
      className="w-full select-none text-left px-3 py-2 text-sm text-neutral-900 hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-800 rounded"
    >
      {children}
    </button>
  );
}
