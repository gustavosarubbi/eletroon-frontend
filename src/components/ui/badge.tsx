import * as React from "react";

export function Badge({ variant = "default", className = "", ...props }: { variant?: "default" | "destructive" } & React.HTMLAttributes<HTMLSpanElement>) {
  const base = "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium";
  const styles = variant === "destructive" ? " bg-red-100 text-red-700" : " bg-green-100 text-green-700";
  return <span className={base + styles + " " + className} {...props} />;
}
