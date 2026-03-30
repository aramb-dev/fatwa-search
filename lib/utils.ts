import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export const isMobile = (): boolean => {
  if (typeof globalThis.window === "undefined") return false;
  return globalThis.window.innerWidth <= 768;
};
