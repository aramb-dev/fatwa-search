import React from "react";
import PropTypes from "prop-types";
import { Dialog } from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

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

const CustomDialogContent = ({ children, ...props }) => (
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
      )}
      {...props}
    >
      {children}
    </motion.div>
  </motion.div>
);

CustomDialogContent.propTypes = {
  children: PropTypes.node.isRequired,
};

const DialogHeader = ({ children }) => (
  <div className="flex flex-col space-y-2 sm:space-y-3 mb-4 sm:mb-6">
    {children}
  </div>
);

DialogHeader.propTypes = {
  children: PropTypes.node.isRequired,
};

const CustomDialogTitle = ({ children }) => (
  <h2 className="text-lg sm:text-xl font-semibold leading-none tracking-tight">
    {children}
  </h2>
);

CustomDialogTitle.propTypes = {
  children: PropTypes.node.isRequired,
};

const DialogFooter = ({ children }) => (
  <div
    className={cn(
      "mt-4 pt-4 sm:mt-6 sm:pt-6",
      "border-t flex flex-col-reverse sm:flex-row gap-2 sm:gap-4",
      "sm:justify-end",
    )}
  >
    {children}
  </div>
);

DialogFooter.propTypes = {
  children: PropTypes.node.isRequired,
};

export const FilterModal = ({ isOpen, onClose, searchResults, siteFilters, setSiteFilters, translations }) => {
  const uniqueSites = Array.from(
    new Set(searchResults.map((result) => new URL(result.link).hostname))
  );

  const handleToggleSite = (site, isChecked) => {
    if (isChecked) {
      setSiteFilters([...siteFilters, site]);
    } else {
      setSiteFilters(siteFilters.filter((s) => s !== site));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <CustomDialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <CustomDialogTitle>{translations.filterResults}</CustomDialogTitle>
          <p className="text-sm text-gray-500">{translations.filterBySite}</p>
          <p className="text-xs text-gray-400 italic">{translations.loadMoreTip}</p>
        </DialogHeader>
        <div className="space-y-4">
          {uniqueSites.map((site) => (
            <div key={site} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={site}
                checked={siteFilters.includes(site)}
                onChange={(e) => handleToggleSite(site, e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor={site}>{site}</label>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setSiteFilters([])}>
            {translations.clearFilters}
          </Button>
          <Button onClick={onClose}>{translations.close}</Button>
        </DialogFooter>
      </CustomDialogContent>
    </Dialog>
  );
};

FilterModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  searchResults: PropTypes.array.isRequired,
  siteFilters: PropTypes.array.isRequired,
  setSiteFilters: PropTypes.func.isRequired,
  translations: PropTypes.object.isRequired,
};
