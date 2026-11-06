import * as React from "react";
import { cn } from "@/src/lib/utils";

function Progress({ className, value, ...props }: React.HTMLAttributes<HTMLDivElement> & { value?: number | null }) {
  const safeValue = Math.max(0, Math.min(100, value ?? 0));
  return <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={safeValue} className={cn("relative h-2 w-full overflow-hidden rounded-full bg-slate-100", className)} {...props}><div className="h-full bg-emerald-600 transition-all" style={{ width: `${safeValue}%` }} /></div>;
}

export { Progress };
