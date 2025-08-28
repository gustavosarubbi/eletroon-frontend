import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "accent" | "ghost" | "success" | "danger" | "warning" | "secondary";
  size?: "default" | "icon" | "sm" | "lg" | "xl";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 hover:scale-105 active:scale-95";
    
    const variantClasses = {
      default: "gradient-primary text-white shadow-lg hover:shadow-xl focus:ring-blue-500/20",
      outline: "border-2 border-blue-500 bg-white text-blue-600 hover:bg-blue-50 hover:border-blue-600 focus:ring-blue-500/20 shadow-sm hover:shadow-md",
      accent: "gradient-accent text-white shadow-lg hover:shadow-xl focus:ring-green-500/20",
      ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500/20",
      success: "gradient-success text-white shadow-lg hover:shadow-xl focus:ring-green-500/20",
      danger: "gradient-danger text-white shadow-lg hover:shadow-xl focus:ring-red-500/20",
      warning: "gradient-warning text-white shadow-lg hover:shadow-xl focus:ring-orange-500/20",
      secondary: "gradient-secondary text-white shadow-lg hover:shadow-xl focus:ring-gray-500/20"
    };
    
    const sizeClasses = {
      sm: "h-8 px-3 text-xs rounded-lg",
      default: "h-10 px-4 py-2 rounded-xl",
      lg: "h-12 px-6 text-base rounded-xl",
      xl: "h-14 px-8 text-lg rounded-2xl",
      icon: "h-10 w-10 p-0 rounded-xl"
    };

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
