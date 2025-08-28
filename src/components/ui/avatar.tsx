import * as React from "react";
import Image from "next/image";

export function Avatar({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full gradient-accent overflow-hidden shadow-lg ${className}`}>
      {children}
    </div>
  );
}

export function AvatarImage({ src, alt, className = "" }: { src?: string; alt?: string; className?: string }) {
  const finalSrc = src ?? "/avatar-placeholder.svg";
  return (
    <Image
      src={finalSrc}
      alt={alt ?? "Avatar"}
      fill
      sizes="40px"
      className={`object-cover ${className}`}
    />
  );
}

export function AvatarFallback({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={`flex h-full w-full items-center justify-center text-white font-bold text-sm ${className}`}>
      {children || "U"}
    </div>
  );
}
