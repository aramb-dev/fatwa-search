import React from "react";
import PropTypes from "prop-types";
import { Dialog } from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { Button } from "../ui/button";

const modalVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const ChannelFilterModal = ({
  isOpen,
  onClose,
  results,
  channelFilters,
  setChannelFilters,
  translations,
}) => {
  const uniqueChannels = Array.from(
    new Set(results.map((r) => r.snippet.channelId)),
  );

  const handleToggleChannel = (channelId, isChecked) => {
    if (isChecked) {
      setChannelFilters([...channelFilters, channelId]);
    } else {
      setChannelFilters(channelFilters.filter((id) => id !== channelId));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <motion.div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        variants={modalVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <h2 className="text-lg font-medium mb-4">
            {translations.filterResults}
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            {translations.filterByChannel}
          </p>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {uniqueChannels.map((channelId) => {
              const channel = results.find(
                (r) => r.snippet.channelId === channelId,
              );
              return (
                <div key={channelId} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={channelId}
                    checked={channelFilters.includes(channelId)}
                    onChange={(e) =>
                      handleToggleChannel(channelId, e.target.checked)
                    }
                    className="rounded border-gray-300"
                  />
                  <label htmlFor={channelId}>
                    {channel?.snippet.channelTitle}
                  </label>
                </div>
              );
            })}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setChannelFilters([])}>
              {translations.clearFilters}
            </Button>
            <Button onClick={onClose}>{translations.close}</Button>
          </div>
        </div>
      </motion.div>
    </Dialog>
  );
};

ChannelFilterModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  results: PropTypes.array.isRequired,
  channelFilters: PropTypes.array.isRequired,
  setChannelFilters: PropTypes.func.isRequired,
  translations: PropTypes.object.isRequired,
};
