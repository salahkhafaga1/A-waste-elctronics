import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  title?: string;
  description?: string;
  className?: string;
  fullPage?: boolean;
}

export function LoadingState({
  title = "جاري التحميل...",
  description,
  className,
  fullPage = false,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center animate-in fade-in-50",
        fullPage ? "min-h-[60vh]" : "min-h-[240px]",
        className
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
      <h4 className="text-base font-semibold text-foreground">{title}</h4>
      {description && (
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
      )}
    </div>
  );
}
