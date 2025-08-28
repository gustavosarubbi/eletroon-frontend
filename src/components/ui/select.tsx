"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={`flex h-12 w-full appearance-none rounded-2xl border-2 border-gray-200 bg-white/90 backdrop-blur-sm px-4 pr-10 py-3 text-gray-900 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:ring-offset-2 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 hover:border-gray-300 hover:shadow-md smooth-transition-fast shadow-sm ${className}`}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600 pointer-events-none z-20" />
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
