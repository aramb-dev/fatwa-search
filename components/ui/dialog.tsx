import React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

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
      type: "spring" as const,
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

export const Dialog = RadixDialog.Root;

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const DialogContent = ({ children, className, onClick }: DialogContentProps) => (
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
        onClick={onClick}
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
      >
        {children}
      </motion.div>
    </RadixDialog.Content>
  </RadixDialog.Portal>
);

interface DialogSectionProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogHeader = ({ children, className }: DialogSectionProps) => (
  <div className={cn("flex flex-col space-y-2 sm:space-y-3 mb-4 sm:mb-6", className)}>
    {children}
  </div>
);

export const DialogTitle = ({ children, className }: DialogSectionProps) => (
  <RadixDialog.Title asChild>
    <h2 className={cn("text-lg sm:text-xl font-semibold leading-none tracking-tight", className)}>
      {children}
    </h2>
  </RadixDialog.Title>
);

export const DialogDescription = ({ children, className }: DialogSectionProps) => (
  <RadixDialog.Description asChild>
    <p className={cn("text-sm text-gray-500", className)}>{children}</p>
  </RadixDialog.Description>
);

export const DialogFooter = ({ children, className }: DialogSectionProps) => (
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
