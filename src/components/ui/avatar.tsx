import * as React from "react";
import Image from "next/image";

export function Avatar({ children }: { children: React.ReactNode }) {
  return <div className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-white overflow-hidden">{children}</div>;
}
export function AvatarImage({ src, alt }: { src?: string; alt?: string }) {
  const finalSrc = src ?? "/avatar-placeholder.svg";
  return (
    <Image
      src={finalSrc}
      alt={alt ?? "Avatar"}
      fill
      sizes="32px"
      className="object-cover"
    />
  );
}
export function AvatarFallback() {
  return null;
}
