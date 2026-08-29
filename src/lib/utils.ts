import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEgyptianPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("20")) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith("0")) {
    return `+20${cleaned.slice(1)}`;
  }
  return `+20${cleaned}`;
}

export function formatPoints(points: number): string {
  return new Intl.NumberFormat("ar-EG").format(points);
}
