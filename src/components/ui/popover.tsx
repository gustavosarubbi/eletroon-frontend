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
    <button 
      type="button" 
      onClick={onClick} 
      className="inline-flex items-center focus-ring smooth-transition-fast"
    >
      {children}
    </button>
  );
}

export function PopoverContent({ 
  children, 
  align = "start",
  className = ""
}: { 
  children: React.ReactNode; 
  align?: "start" | "end" | string;
  className?: string;
}) {
  const ctx = React.useContext(PopoverContext);
  const [isVisible, setIsVisible] = React.useState(false);
  
  React.useEffect(() => {
    if (ctx?.open) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 150);
      return () => clearTimeout(timer);
    }
  }, [ctx?.open]);

  if (!ctx) return null;
  if (!ctx.open && !isVisible) return null;
  
  return (
    <div 
      className={`absolute z-popover mt-2 min-w-[240px] ${
        align === "end" ? "right-0" : "left-0"
      } rounded-2xl gradient-glass shadow-2xl border border-white/20 backdrop-blur-xl p-4 ${
        isVisible ? 'animate-fade-in-scale' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}


