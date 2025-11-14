import React, { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { Youtube, X, Filter, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog } from "@radix-ui/react-dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

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

const YoutubeSearch = ({ translations }) => {
  // State declarations
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scholarRequest, setScholarRequest] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [channelRequest, setChannelRequest] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [startIndex, setStartIndex] = useState(0);
  const [activeModal, setActiveModal] = useState(null);
  const [channelFilters, setChannelFilters] = useState([]);
  const [searchParams] = useSearchParams();

  // Refs
  const initialLoadDoneRef = useRef(false);
  const previousSearchRef = useRef("");
  const resultsPerPage = 10;

  // Dedicated search function
  const performYoutubeSearch = useCallback(
    async (isNewSearch = false) => {
      const currentQuery = searchQuery.trim();
      if (!currentQuery) return;

      setLoading(true);
      if (isNewSearch) {
        setStartIndex(0);
        setResults([]);
      }

      try {
        const channelsToSearch = CHANNELS.slice(
          isNewSearch ? 0 : startIndex,
          isNewSearch ? resultsPerPage : startIndex + resultsPerPage,
        );

        const searches = channelsToSearch.map(async (channelId) => {
          const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
              currentQuery,
            )}&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}&type=video&maxResults=5&channelId=${channelId}`,
          );
          const data = await response.json();

          if (data.error?.code === 403) {
            if (
              data.error.errors?.some(
                (err) =>
                  err.reason === "quotaExceeded" ||
                  err.message?.includes("quota"),
              )
            ) {
              throw new Error("QUOTA_EXCEEDED");
            }
          }

          return data.items || [];
        });

        const newResults = (await Promise.all(searches)).flat();
        newResults.sort(
          (a, b) =>
            new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt),
        );

        setResults((prev) =>
          isNewSearch ? newResults : [...prev, ...newResults],
        );
        setHasMore(startIndex + resultsPerPage < CHANNELS.length);
        if (!isNewSearch) {
          setStartIndex((prev) => prev + resultsPerPage);
        }
      } catch (error) {
        console.error("YouTube search failed:", error);
        toast.error(
          error.message === "QUOTA_EXCEEDED"
            ? "API quota exceeded. Please try again later."
            : "Failed to perform search",
        );
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, startIndex],
  );

  // Handle URL params and initial search
  useEffect(() => {
    const queryParam = searchParams?.get("q");

    if (queryParam && !initialLoadDoneRef.current) {
      setSearchQuery(queryParam);
      previousSearchRef.current = queryParam;
      initialLoadDoneRef.current = true;

      // Wrap in setTimeout to ensure state updates have completed
      setTimeout(() => {
        performYoutubeSearch(true);
      }, 0);
    }
  }, [searchParams, performYoutubeSearch]);

  // Add this new effect to handle direct URL access
  useEffect(() => {
    const queryParam = searchParams?.get("q");
    if (queryParam && window.location.pathname === "/yt-search") {
      setSearchQuery(queryParam);
      performYoutubeSearch(true);
    }
  }, [searchParams, performYoutubeSearch]); // Include required dependencies

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

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Create URL with correct path
    const url = new URL(window.location.href);
    url.pathname = "/yt-search"; // Ensure we're on the YouTube search path
    url.searchParams.set("q", searchQuery);

    if (navigator.share) {
      navigator
        .share({
          title: "Fatwa Search Results",
          text: `Check out these YouTube search results for "${searchQuery}"`,
          url: url.toString(),
        })
        .catch((error) => {
          console.error("Error sharing:", error);
          // Fallback to clipboard if sharing fails
          navigator.clipboard.writeText(url.toString());
          toast.success("Link copied to clipboard!");
        });
    } else {
      navigator.clipboard.writeText(url.toString());
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={translations.searchPlaceholder}
            className="flex-grow"
          />
          <Button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Youtube className="h-4 w-4" />
            {loading ? translations.searching : translations.searchAction}
          </Button>

          {/* Add Share Button */}
          {searchQuery && (
            <Button
              variant="outline"
              onClick={handleShare}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              {translations.share}
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => setShowRequestModal(true)}
            className="flex items-center gap-2"
          >
            {translations.requestChannel}
          </Button>
          {results.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setActiveModal("filter")}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {translations.filter}
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
                <div
                  className="relative w-full aspect-video cursor-pointer"
                  onClick={() => setSelectedVideo(video)}
                >
                  <Image
                    src={video.snippet.thumbnails.medium.url}
                    alt={video.snippet.title || "YouTube video thumbnail"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    priority={false}
                  />
                </div>
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
                          {translations.viewOnYoutube}
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
                    {translations.requestScholar}
                  </h2>
                  <Input
                    value={scholarRequest}
                    onChange={(e) => setScholarRequest(e.target.value)}
                    placeholder={translations.enterScholarName}
                    className="mb-4"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowRequestModal(false)}
                    >
                      {translations.enterScholarName}
                    </Button>
                    <Button onClick={handleScholarRequest}>
                      {translations.submitRequest}
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
                      onClick={() => setShowRequestModal(false)}
                    >
                      {translations.cancel}
                    </Button>
                    <Button onClick={handleChannelRequest}>
                      {translations.submitRequest}
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
              {loading ? translations.loading : translations.loadMore}
            </Button>
            <Button
              variant="outline"
              onClick={() => setActiveModal("feedback")}
              className="shadow-lg bg-white hover:bg-gray-50"
            >
              {translations.provideFeedback}
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
                  <h2 className="text-lg font-medium mb-4">
                    {translations.filterResults}
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    {translations.filterByChannel}
                  </p>
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                    {Array.from(
                      new Set(results.map((r) => r.snippet.channelId)),
                    ).map((channelId) => {
                      const channel = results.find(
                        (r) => r.snippet.channelId === channelId,
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
                                    (id) => id !== channelId,
                                  ),
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
                      {translations.clearFilters}
                    </Button>
                    <Button onClick={() => setActiveModal(null)}>
                      {translations.close}
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
