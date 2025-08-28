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
      <span onClick={() => ctx.setOpen(true)} className="inline-flex cursor-pointer">
        {children}
      </span>
    );
  }
  return (
    <button 
      type="button" 
      onClick={() => ctx.setOpen(true)} 
      className="inline-flex items-center focus-ring smooth-transition-fast"
    >
      {children}
    </button>
  );
}

export function DialogContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(DialogContext)!;
  const [isVisible, setIsVisible] = React.useState(false);
  
  React.useEffect(() => {
    if (ctx.open) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setIsVisible(false), 200);
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [ctx.open]);

  if (!ctx.open && !isVisible) return null;
  
  return (
    <div className={`fixed inset-0 z-modal flex items-center justify-center p-4 ${isVisible ? 'animate-fade-in-scale' : ''}`}>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-overlay bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`} 
        onClick={() => ctx.setOpen(false)} 
      />
      
      {/* Dialog Content */}
      <div 
        className={`relative z-max w-full max-w-md rounded-3xl gradient-glass shadow-2xl border border-white/20 backdrop-blur-xl ${className} ${
          isVisible ? 'animate-fade-in-scale' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mb-6 ${className}`}>
      {children}
    </div>
  );
}

export function DialogTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`text-xl font-bold text-gradient-hero leading-tight ${className}`}>
      {children}
    </h2>
  );
}

export function DialogDescription({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-sm text-gray-700 leading-relaxed ${className}`}>
      {children}
    </p>
  );
}

export function DialogFooter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-end gap-3 pt-6 border-t border-gray-200/50 ${className}`}>
      {children}
    </div>
  );
}
