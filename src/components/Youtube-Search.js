import React, { useState, useCallback } from "react";
import { Youtube, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog } from "@radix-ui/react-dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";

// Animation variants
const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const modalVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

// Default scholars array
const SCHOLARS = [
  "شيخ بن باز",
  "شيخ بن عثيمين",
  "شيخ الألباني",
  "شيخ مقبل",
  "شيخ ربيع",
];

const YoutubeSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [scholarRequest, setScholarRequest] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);

  const performYoutubeSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      // Perform searches for each scholar
      const searches = SCHOLARS.map(async (scholar) => {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
            `${searchQuery} ${scholar}`
          )}&key=${
            process.env.REACT_APP_YOUTUBE_API_KEY
          }&type=video&maxResults=5`
        );
        const data = await response.json();
        return data.items || [];
      });

      const allResults = await Promise.all(searches);
      const flatResults = allResults.flat();
      setResults(flatResults);
    } catch (error) {
      console.error("YouTube search failed:", error);
      toast.error("Failed to fetch YouTube results");
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const handleScholarRequest = async () => {
    if (!scholarRequest.trim()) {
      toast.error("Please enter a scholar's name");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("scholar-request", scholarRequest);

      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString(),
      });

      toast.success("Scholar request submitted successfully!");
      setScholarRequest("");
      setShowRequestModal(false);
    } catch (error) {
      toast.error("Failed to submit scholar request");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="space-y-4">
        <div className="flex gap-2 mb-4">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search YouTube videos..."
            className="flex-grow"
          />
          <Button
            onClick={performYoutubeSearch}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Youtube className="h-4 w-4" />
            {loading ? "Searching..." : "Search"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowRequestModal(true)}
            className="flex items-center gap-2"
          >
            Request Scholar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {results.map((video) => (
              <motion.div
                key={video.id.videoId}
                variants={cardVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="border rounded-lg overflow-hidden shadow-sm"
              >
                <img
                  src={video.snippet.thumbnails.medium.url}
                  alt={video.snippet.title}
                  className="w-full aspect-video object-cover cursor-pointer"
                  onClick={() => setSelectedVideo(video)}
                />
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

        {/* Video Modal */}
        <AnimatePresence>
          {selectedVideo && (
            <Dialog open={true} onOpenChange={() => setSelectedVideo(null)}>
              <motion.div
                className="fixed inset-0 bg-black/50 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="fixed inset-4 md:inset-10 bg-white rounded-lg z-50 flex flex-col">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="font-medium truncate pr-4">
                      {selectedVideo.snippet.title}
                    </h2>
                    <div className="flex gap-2">
                      <a
                        href={`https://youtube.com/watch?v=${selectedVideo.id.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Youtube className="h-4 w-4" />
                          View on YouTube
                        </Button>
                      </a>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedVideo(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 relative">
                    <iframe
                      src={`https://www.youtube.com/embed/${selectedVideo.id.videoId}`}
                      className="absolute inset-0 w-full h-full"
                      frameBorder="0"
                      allowFullScreen
                      title={selectedVideo.snippet.title}
                    />
                  </div>
                </div>
              </motion.div>
            </Dialog>
          )}
        </AnimatePresence>

        {/* Scholar Request Modal */}
        <AnimatePresence>
          {showRequestModal && (
            <Dialog open={true} onOpenChange={() => setShowRequestModal(false)}>
              <motion.div
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
                variants={modalVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                  <h2 className="text-lg font-medium mb-4">
                    Request a Scholar
                  </h2>
                  <Input
                    value={scholarRequest}
                    onChange={(e) => setScholarRequest(e.target.value)}
                    placeholder="Enter scholar's name..."
                    className="mb-4"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowRequestModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleScholarRequest}>
                      Submit Request
                    </Button>
                  </div>
                </div>
              </motion.div>
            </Dialog>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default YoutubeSearch;
