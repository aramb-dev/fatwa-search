import { cn } from "../../lib/utils";

/**
 * Skeleton loading component for showing loading states
 * Provides a shimmer animation effect
 */
function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  );
}

export { Skeleton };
