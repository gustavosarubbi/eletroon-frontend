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
    <button 
      type="button" 
      onClick={handleClick} 
      className="inline-flex items-center focus-ring smooth-transition-fast"
    >
      {children}
    </button>
  );
}

export function DropdownMenuContent({ 
  children, 
  align = "start",
  className = ""
}: { 
  children: React.ReactNode; 
  align?: "start" | "end" | string;
  className?: string;
}) {
  const ctx = React.useContext(MenuContext);
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
      className={`absolute z-dropdown mt-2 min-w-[200px] ${
        align === "end" ? "right-0" : "left-0"
      } rounded-2xl gradient-glass shadow-2xl border border-white/20 backdrop-blur-xl ${
        isVisible ? 'animate-fade-in-scale' : ''
      } ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

export function DropdownMenuLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-4 py-2 text-xs font-bold text-gradient-hero uppercase tracking-wide ${className}`}>
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({ className = "" }: { className?: string }) {
  return (
    <div className={`my-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent ${className}`} />
  );
}

export function DropdownMenuItem({ 
  onClick, 
  children, 
  className = "",
  disabled = false
}: { 
  onClick?: () => void; 
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const ctx = React.useContext(MenuContext);
  const handle = () => {
    if (!disabled) {
      onClick?.();
      ctx?.setOpen(false);
    }
  };
  
  return (
    <button
      onClick={handle}
      disabled={disabled}
      className={`w-full select-none text-left px-4 py-3 text-sm text-gray-700 hover:text-gray-900 hover:bg-blue-50/50 rounded-xl smooth-transition-fast focus-ring ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      {children}
    </button>
  );
}
