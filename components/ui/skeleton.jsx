import PropTypes from "prop-types";
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

Skeleton.propTypes = {
  className: PropTypes.string,
};

export { Skeleton };
