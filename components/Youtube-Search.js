import React, { useState, useCallback, useEffect, useRef } from "react";
import { Youtube, Filter, Share2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { VideoGrid } from "./youtube/VideoGrid";
import { VideoModal } from "./youtube/VideoModal";
import { ChannelRequestModal } from "./youtube/ChannelRequestModal";
import { ChannelFilterModal } from "./youtube/ChannelFilterModal";

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
            `/api/youtube?q=${encodeURIComponent(currentQuery)}&channelId=${channelId}&maxResults=5`
          );
          const data = await response.json();

          if (data.error) {
            if (data.error === "QUOTA_EXCEEDED") {
              throw new Error("QUOTA_EXCEEDED");
            }
            console.error(`YouTube search error for channel ${channelId}:`, data.error);
            return [];
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
      setActiveModal(null);
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
            onClick={() => setActiveModal("channel")}
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

        <VideoGrid videos={filteredResults} onVideoClick={setSelectedVideo} />

        <AnimatePresence>
          {selectedVideo && (
            <VideoModal
              video={selectedVideo}
              onClose={() => setSelectedVideo(null)}
              translations={translations}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {activeModal === "channel" && (
            <ChannelRequestModal
              isOpen={true}
              onClose={() => setActiveModal(null)}
              channelRequest={channelRequest}
              setChannelRequest={setChannelRequest}
              onSubmit={handleChannelRequest}
              translations={translations}
            />
          )}
        </AnimatePresence>

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

        <AnimatePresence>
          {activeModal === "filter" && (
            <ChannelFilterModal
              isOpen={true}
              onClose={() => setActiveModal(null)}
              results={results}
              channelFilters={channelFilters}
              setChannelFilters={setChannelFilters}
              translations={translations}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default YoutubeSearch;
