import React from "react";
import PropTypes from "prop-types";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const VideoGrid = ({ videos, onVideoClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence>
        {videos.map((video) => (
          <motion.div
            key={video.id.videoId}
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="border rounded-lg overflow-hidden shadow-sm"
          >
            <button
              type="button"
              className="relative w-full aspect-video cursor-pointer block"
              onClick={() => onVideoClick(video)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onVideoClick(video);
                }
              }}
              aria-label={`Play video: ${video.snippet.title}`}
            >
              <Image
                src={video.snippet.thumbnails.medium.url}
                alt={video.snippet.title || "YouTube video thumbnail"}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                priority={false}
              />
            </button>
            <div className="p-4">
              <h3 className="font-medium line-clamp-2">
                {video.snippet.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {video.snippet.channelTitle}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

VideoGrid.propTypes = {
  videos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.shape({
        videoId: PropTypes.string.isRequired,
      }).isRequired,
      snippet: PropTypes.shape({
        title: PropTypes.string.isRequired,
        channelTitle: PropTypes.string.isRequired,
        thumbnails: PropTypes.shape({
          medium: PropTypes.shape({
            url: PropTypes.string.isRequired,
          }).isRequired,
        }).isRequired,
      }).isRequired,
    }),
  ).isRequired,
  onVideoClick: PropTypes.func.isRequired,
};
