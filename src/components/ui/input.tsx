import * as React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className = "", ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={
        "flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm " +
        "text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-neutral-400 " +
        "dark:bg-white dark:text-black dark:placeholder-black " +
        className
      }
      {...props}
    />
  );
});

Input.displayName = "Input";
