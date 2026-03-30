import React from "react";
import { Dialog } from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import type { Translation } from "../../lib/types";

const modalVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

interface ChannelRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelRequest: string;
  setChannelRequest: (v: string) => void;
  onSubmit: () => void;
  translations: Translation;
}

export const ChannelRequestModal = ({
  isOpen,
  onClose,
  channelRequest,
  setChannelRequest,
  onSubmit,
  translations,
}: ChannelRequestModalProps) => {
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
            <Button variant="outline" onClick={onClose}>
              {translations.cancel}
            </Button>
            <Button onClick={onSubmit}>{translations.submitRequest}</Button>
          </div>
        </div>
      </motion.div>
    </Dialog>
  );
};
