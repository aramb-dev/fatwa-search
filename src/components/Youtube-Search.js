import React, { useState, useCallback } from "react";
import { Youtube, X, Filter } from "lucide-react";
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

// Default channels array
const CHANNELS = [
  "UCFjzJYgxHjk44AFoEwwgPjg",
  "UCi7vzSJrU3beV_6Sdgpowng",
  "UCMgtvQNueoOwjAgo-fMF-lQ",
  "UCphY7uVzua2z_Mq1oZcOXGA",
  "UCQPQtAxx45gjN44ZOw4cqmw",
  "UCtF3YygTiodnYSw8vD3UJtQ",
  "UCP44H-iDsDp-_wV85QKkdVA",
  "UCPPQcw5SA1yeQHttDbdxXGw",
  "UC-V7X5AL2krPtSanQEbCbAQ",
  "UCwMocSKEbLav6SZvwzTvDbQ",
  "UC6u5aFIhKDOC_WYKVLBw8Dg",
  "UCS-XgiMGKaiQsZNkgwsDbYg",
  "UCWSfNmixfPlKg9OCoqghwwg",
  "UCiiJRwQ0MUaQo8ZZuf18pPw",
  "UCO_MLsqOIoqYXbSXfyqluxw",
  "UCYbR2Su3mqwl88US4eyrQdg",
  "UCLHZET13eDxW-z1tSKTAdVg",
  "UCXI4M81wRAVYlFPw7V1l3Mw",
  "UCYZkmbBbVMWxB1gyioTPLIA",
  "UCleHL3J-q13VVmy7_WwFLCw",
  "UC0ljB6Xfg9RWjFWNb4JO-IQ",
];

const YoutubeSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [scholarRequest, setScholarRequest] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [channelRequest, setChannelRequest] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [startIndex, setStartIndex] = useState(0);
  const [activeModal, setActiveModal] = useState(null);
  const [channelFilters, setChannelFilters] = useState([]);
  const resultsPerPage = 10;

  const performYoutubeSearch = useCallback(
    async (isNewSearch = false) => {
      if (!searchQuery.trim()) return;

      setLoading(true);
      try {
        // Calculate which channels to search based on pagination
        const channelsToSearch = CHANNELS.slice(
          startIndex,
          startIndex + resultsPerPage
        );

        const searches = channelsToSearch.map(async (channelId) => {
          const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
              searchQuery
            )}&key=${
              process.env.REACT_APP_YOUTUBE_API_KEY
            }&type=video&maxResults=5&channelId=${channelId}`
          );
          const data = await response.json();

          // Check for quota exceeded error
          if (data.error && data.error.code === 403) {
            if (
              data.error.errors?.some(
                (err) =>
                  err.reason === "quotaExceeded" ||
                  err.message?.includes("quota")
              )
            ) {
              throw new Error("QUOTA_EXCEEDED");
            }
          }

          return data.items || [];
        });

        const newResults = (await Promise.all(searches)).flat();

        // Sort by date
        newResults.sort(
          (a, b) =>
            new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt)
        );

        setResults((prev) =>
          isNewSearch ? newResults : [...prev, ...newResults]
        );
        setHasMore(startIndex + resultsPerPage < CHANNELS.length);
        if (!isNewSearch) {
          setStartIndex((prev) => prev + resultsPerPage);
        }
      } catch (error) {
        console.error("YouTube search failed:", error);
        if (error.message === "QUOTA_EXCEEDED") {
          toast.error(
            "Sorry, Youtube API quota limit reached. Please try again in 24hrs.",
            {
              duration: 10000, // Show for 10 seconds
              closeButton: true,
            }
          );
        } else {
          toast.error("Failed to fetch YouTube results");
        }
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, startIndex]
  );

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

  const handleChannelRequest = async () => {
    if (!channelRequest.trim()) {
      toast.error("Please enter a YouTube channel URL");
      return;
    }

    // Validate if it's a YouTube channel URL
    const channelUrlPattern =
      /^(https?:\/\/)?(www\.)?youtube\.com\/(channel|c)\/[a-zA-Z0-9_-]+\/?$/;
    if (!channelUrlPattern.test(channelRequest)) {
      toast.error("Please enter a valid YouTube channel URL");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("form-name", "youtube-channel-request");
      formData.append("channel-url", channelRequest);

      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString(),
      });

      toast.success("Channel request submitted successfully!");
      setChannelRequest("");
      setShowRequestModal(false);
    } catch (error) {
      toast.error("Failed to submit channel request");
    }
  };

  // Add filter functionality
  const filteredResults = results.filter((result) => {
    if (channelFilters.length === 0) return true;
    return channelFilters.includes(result.snippet.channelId);
  });

  // Add handleSearch function for new searches
  const handleSearch = async (e) => {
    e.preventDefault();
    setStartIndex(0);
    setHasMore(true);
    await performYoutubeSearch(true);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search YouTube videos..."
            className="flex-grow"
          />
          <Button
            type="submit"
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
            Request Channel
          </Button>
          {results.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setActiveModal("filter")}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          )}
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredResults.map((video) => (
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

        {/* Channel Request Modal */}
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
                    Request YouTube Channel
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Paste YouTube link to the Shaykh's YouTube channel
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
                      onClick={() => setShowRequestModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleChannelRequest}>
                      Submit Request
                    </Button>
                  </div>
                </div>
              </motion.div>
            </Dialog>
          )}
        </AnimatePresence>

        {/* Add Load More and Feedback buttons */}
        {results.length > 0 && hasMore && !loading && (
          <div className="fixed bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
            <Button
              onClick={() => performYoutubeSearch()}
              disabled={loading}
              variant="outline"
              className="w-full max-w-sm shadow-lg bg-white hover:bg-gray-50"
            >
              {loading ? "Loading..." : "Load More Results"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setActiveModal("feedback")}
              className="shadow-lg bg-white hover:bg-gray-50"
            >
              Provide Feedback
            </Button>
          </div>
        )}

        {/* Add Filter Modal */}
        <AnimatePresence>
          {activeModal === "filter" && (
            <Dialog open={true} onOpenChange={() => setActiveModal(null)}>
              <motion.div
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
                variants={modalVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                  <h2 className="text-lg font-medium mb-4">Filter Results</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Filter results by channel
                  </p>
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                    {Array.from(
                      new Set(results.map((r) => r.snippet.channelId))
                    ).map((channelId) => {
                      const channel = results.find(
                        (r) => r.snippet.channelId === channelId
                      );
                      return (
                        <div
                          key={channelId}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            id={channelId}
                            checked={channelFilters.includes(channelId)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setChannelFilters([
                                  ...channelFilters,
                                  channelId,
                                ]);
                              } else {
                                setChannelFilters(
                                  channelFilters.filter(
                                    (id) => id !== channelId
                                  )
                                );
                              }
                            }}
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
                    <Button
                      variant="outline"
                      onClick={() => setChannelFilters([])}
                    >
                      Clear Filters
                    </Button>
                    <Button onClick={() => setActiveModal(null)}>Close</Button>
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
