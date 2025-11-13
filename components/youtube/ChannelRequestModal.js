import React from "react";
import PropTypes from "prop-types";
import { Dialog } from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const modalVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const ChannelRequestModal = ({ isOpen, onClose, channelRequest, setChannelRequest, onSubmit, translations }) => {
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
            {translations.requestChannel}
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            {translations.pasteYoutubeLink}
          </p>
          <Input
            value={channelRequest}
            onChange={(e) => setChannelRequest(e.target.value)}
            placeholder="https://youtube.com/channel/..."
            className="mb-4"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
            >
              {translations.cancel}
            </Button>
            <Button onClick={onSubmit}>
              {translations.submitRequest}
            </Button>
          </div>
        </div>
      </motion.div>
    </Dialog>
  );
};

ChannelRequestModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  channelRequest: PropTypes.string.isRequired,
  setChannelRequest: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  translations: PropTypes.object.isRequired,
};
