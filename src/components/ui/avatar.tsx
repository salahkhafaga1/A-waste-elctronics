import * as React from "react";
import Image from "next/image";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallbackText?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

export function Avatar({
  src,
  alt = "User Avatar",
  fallbackText,
  size = "md",
  className,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  const getInitials = (text?: string) => {
    if (!text) return "";
    const parts = text.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return text.slice(0, 2).toUpperCase();
  };

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full border border-border bg-emerald-100/70 text-emerald-800 font-bold items-center justify-center select-none shadow-sm",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src && !imageError ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="80px"
          className="aspect-square h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : fallbackText ? (
        <span>{getInitials(fallbackText)}</span>
      ) : (
        <User className="h-1/2 w-1/2 text-emerald-700" />
      )}
    </div>
  );
}
