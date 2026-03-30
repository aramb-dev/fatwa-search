import React from "react";
import { Dialog } from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Play as Youtube, X } from "lucide-react";
import type { VideoItem, Translation } from "../../lib/types";

interface VideoModalProps {
  video: VideoItem | null;
  onClose: () => void;
  translations: Translation;
}

export const VideoModal = ({ video, onClose, translations }: VideoModalProps) => {
  if (!video) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <motion.div
        className="fixed inset-0 bg-black/50 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="fixed inset-4 md:inset-10 bg-white rounded-lg z-50 flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-medium truncate pr-4">{video.snippet.title}</h2>
            <div className="flex gap-2">
              <a
                href={`https://youtube.com/watch?v=${video.id.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="flex items-center gap-2">
                  <Youtube className="h-4 w-4" />
                  {translations.viewOnYoutube}
                </Button>
              </a>
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 relative">
            <iframe
              src={`https://www.youtube.com/embed/${video.id.videoId}`}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allowFullScreen
              title={video.snippet.title}
            />
          </div>
        </div>
      </motion.div>
    </Dialog>
  );
};
