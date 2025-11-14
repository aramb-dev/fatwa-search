import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names using clsx and tailwind-merge
 * Properly handles Tailwind CSS class conflicts by merging classes intelligently
 * @param {...(string|Object|Array)} inputs - Class names or conditional class objects
 * @returns {string} Merged class name string
 * @example
 * cn('px-2 py-1', 'px-4') // Returns: 'py-1 px-4' (px-4 overrides px-2)
 * cn('text-red-500', { 'text-blue-500': isActive }) // Conditional classes
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Check if the current viewport is mobile-sized
 * @returns {boolean} True if viewport width is <= 768px
 */
export const isMobile = () => {
  if (typeof window === "undefined") return false;
  return window.innerWidth <= 768;
};
