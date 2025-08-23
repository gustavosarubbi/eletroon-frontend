import * as React from "react";

export function Table({ className = "", ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return <table className={"w-full text-sm " + className} {...props} />;
}
export function TableHeader({ className = "", ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={"bg-muted/50 " + className} {...props} />;
}
export function TableBody({ className = "", ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={className} {...props} />;
}
export function TableRow({ className = "", ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={"border-b " + className} {...props} />;
}
export function TableHead({ className = "", ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={"px-4 py-2 text-left font-medium " + className} {...props} />;
}
export function TableCell({ className = "", ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={"px-4 py-2 " + className} {...props} />;
}
export function TableCaption({ className = "", ...props }: React.HTMLAttributes<HTMLTableCaptionElement>) {
      return <caption className={"mt-2 text-xs text-black dark:text-neutral-300 " + className} {...props} />;
}
