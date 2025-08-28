import * as React from "react";

export function Badge({ 
  variant = "default", 
  className = "", 
  ...props 
}: { 
  variant?: "default" | "destructive" | "success" | "warning" | "info" | "accent" | "secondary"
} & React.HTMLAttributes<HTMLSpanElement>) {
  const base = "inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-300 shadow-sm";
  
  const variants = {
    default: "bg-blue-100 text-blue-700 border border-blue-200 shadow-blue-100",
    destructive: "bg-red-100 text-red-700 border border-red-200 shadow-red-100",
    success: "bg-green-100 text-green-700 border border-green-200 shadow-green-100",
    warning: "bg-orange-100 text-orange-700 border border-orange-200 shadow-orange-100",
    info: "bg-purple-100 text-purple-700 border border-purple-200 shadow-purple-100",
    accent: "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg",
    secondary: "bg-gray-100 text-gray-700 border border-gray-200 shadow-gray-100"
  };
  
  return <span className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
