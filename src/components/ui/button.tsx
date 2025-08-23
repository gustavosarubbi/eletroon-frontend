import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
  size?: "default" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    const variantClass = variant === "outline"
      ? "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
      : "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800";
    const sizeClass = size === "icon" ? "h-9 w-9 p-0" : "h-10 px-4 py-2";

    return (
      <button
        ref={ref}
        className={
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed " +
          variantClass + " " + sizeClass + " " + className
        }
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
