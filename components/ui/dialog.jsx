import React from "react";
import PropTypes from "prop-types";
import * as RadixDialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

// Animation variants for modal.
// Centering (y: "-50%") is baked into the animate variant so Framer Motion
// owns ALL y transforms — no conflict between CSS classes and inline styles.
// initial/exit add +20px to slide up on open and down on close.
const modalVariants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: "calc(-50% + 20px)",
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: "-50%",
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 400,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: "calc(-50% + 20px)",
    transition: {
      duration: 0.2,
    },
  },
};

const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Dialog root component - wraps the entire dialog
 */
export const Dialog = RadixDialog.Root;

/**
 * Dialog content component with animations and proper focus management
 * Uses Radix UI's Portal and Content for accessibility features like focus trapping
 */
export const DialogContent = ({ children, className, ...props }) => (
  <RadixDialog.Portal>
    <RadixDialog.Overlay asChild>
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={overlayVariants}
        className="fixed inset-0 z-50 bg-black/50"
      />
    </RadixDialog.Overlay>
    <RadixDialog.Content asChild aria-describedby={undefined}>
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={modalVariants}
        style={{ x: "-50%" }}
        className={cn(
          "fixed left-[50%] top-[50%] z-50",
          "w-[calc(100%-2rem)] max-w-[670px]",
          "min-h-[200px]",
          "bg-white rounded-lg",
          "p-6",
          "shadow-lg",
          "overflow-y-auto max-h-[90vh]",
          "focus:outline-none",
          className,
        )}
        {...props}
      >
        {children}
      </motion.div>
    </RadixDialog.Content>
  </RadixDialog.Portal>
);

DialogContent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * Dialog header component
 */
export const DialogHeader = ({ children, className }) => (
  <div
    className={cn(
      "flex flex-col space-y-2 sm:space-y-3 mb-4 sm:mb-6",
      className,
    )}
  >
    {children}
  </div>
);

DialogHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * Dialog title component with proper ARIA labeling
 * Uses Radix UI's Title for proper accessibility announcements
 */
export const DialogTitle = ({ children, className }) => (
  <RadixDialog.Title asChild>
    <h2
      className={cn(
        "text-lg sm:text-xl font-semibold leading-none tracking-tight",
        className,
      )}
    >
      {children}
    </h2>
  </RadixDialog.Title>
);

DialogTitle.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * Dialog description component with proper ARIA description
 * Uses Radix UI's Description for accessibility
 */
export const DialogDescription = ({ children, className }) => (
  <RadixDialog.Description asChild>
    <p className={cn("text-sm text-gray-500", className)}>{children}</p>
  </RadixDialog.Description>
);

DialogDescription.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * Dialog footer component
 */
export const DialogFooter = ({ children, className }) => (
  <div
    className={cn(
      "mt-4 pt-4 sm:mt-6 sm:pt-6",
      "border-t flex flex-col-reverse sm:flex-row gap-2 sm:gap-4",
      "sm:justify-end",
      className,
    )}
  >
    {children}
  </div>
);

DialogFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
