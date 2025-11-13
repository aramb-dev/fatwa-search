import React from "react";
import PropTypes from "prop-types";
import { Dialog as RadixDialog } from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

// Animation variants for modal
const modalVariants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 400,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
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
export const Dialog = RadixDialog;

/**
 * Dialog content component with animations
 */
export const DialogContent = ({ children, className, ...props }) => (
  <motion.div
    initial="initial"
    animate="animate"
    exit="exit"
    variants={overlayVariants}
    className="fixed inset-0 z-50 flex items-center justify-center"
  >
    <div className="fixed inset-0 bg-black/50" />
    <motion.div
      variants={modalVariants}
      className={cn(
        "relative",
        "w-full max-w-[670px]",
        "min-h-[200px]",
        "bg-white rounded-lg",
        "p-6",
        "shadow-lg",
        "mx-4 sm:mx-auto",
        "z-50",
        "overflow-y-auto max-h-[90vh]",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  </motion.div>
);

DialogContent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * Dialog header component
 */
export const DialogHeader = ({ children, className }) => (
  <div className={cn("flex flex-col space-y-2 sm:space-y-3 mb-4 sm:mb-6", className)}>
    {children}
  </div>
);

DialogHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * Dialog title component
 */
export const DialogTitle = ({ children, className }) => (
  <h2 className={cn("text-lg sm:text-xl font-semibold leading-none tracking-tight", className)}>
    {children}
  </h2>
);

DialogTitle.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * Dialog description component
 */
export const DialogDescription = ({ children, className }) => (
  <p className={cn("text-sm text-gray-500", className)}>
    {children}
  </p>
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
      className
    )}
  >
    {children}
  </div>
);

DialogFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
