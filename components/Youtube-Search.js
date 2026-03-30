import React, { useState, useCallback, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Play as Youtube, Filter, Share2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { AnimatePresence } from "framer-motion";
import { VideoGrid } from "./youtube/VideoGrid";
import { VideoModal } from "./youtube/VideoModal";
import { ChannelRequestModal } from "./youtube/ChannelRequestModal";
import { ChannelFilterModal } from "./youtube/ChannelFilterModal";
import { youtubeCache } from "../lib/cache";
import { ARABIC_CHANNELS, RESULTS_PER_PAGE } from "../lib/constants";


const YoutubeSearch = ({ translations, language = "ar" }) => {
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
  const searchParams = useSearchParams();
  const router = useRouter();

  // Refs
  const initialLoadDoneRef = useRef(false);
  const previousSearchRef = useRef("");
  const abortControllerRef = useRef(null);
  const resultsPerPage = RESULTS_PER_PAGE;

  /**
   * Performs a YouTube search across configured scholar channels
   * Handles caching, parallel searches, request cancellation, and result sorting
   * @param {boolean} isNewSearch - Whether this is a new search or loading more results
   * @returns {Promise<void>}
   */
  const performYoutubeSearch = useCallback(
    async (isNewSearch = false) => {
      const currentQuery = searchQuery.trim();
      if (!currentQuery) return;

      // Cancel previous request if still running
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new AbortController for this request
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      setLoading(true);
      if (isNewSearch) {
        setStartIndex(0);
        setResults([]);
      }

      try {
        const channelsToSearch = ARABIC_CHANNELS.slice(
          isNewSearch ? 0 : startIndex,
          isNewSearch ? resultsPerPage : startIndex + resultsPerPage,
        );

        // Check cache first
        const cacheKey = {
          query: currentQuery,
          channels: channelsToSearch,
          startIndex: isNewSearch ? 0 : startIndex,
        };
        const cachedResults = youtubeCache.get(cacheKey);

        if (cachedResults && isNewSearch) {
          setResults(cachedResults);
          setHasMore(startIndex + resultsPerPage < ARABIC_CHANNELS.length);
          setLoading(false);
          return;
        }

        const searches = channelsToSearch.map(async (channelId) => {
          const response = await fetch(
            `/api/youtube?q=${encodeURIComponent(currentQuery)}&channelId=${channelId}&maxResults=5`,
            { signal },
          );
          const data = await response.json();

          if (data.error) {
            if (data.error === "QUOTA_EXCEEDED") {
              throw new Error("QUOTA_EXCEEDED");
            }
            console.error(
              `YouTube search error for channel ${channelId}:`,
              data.error,
            );
            return [];
          }

          return data.items || [];
        });

        const newResults = (await Promise.all(searches)).flat();
        newResults.sort(
          (a, b) =>
            new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt),
        );

        setResults((prev) => {
          const finalResults = isNewSearch
            ? newResults
            : [...prev, ...newResults];

          // Cache the results for new searches only
          if (isNewSearch && newResults.length > 0) {
            youtubeCache.set(cacheKey, newResults);
          }

          return finalResults;
        });

        setHasMore(startIndex + resultsPerPage < ARABIC_CHANNELS.length);
        if (!isNewSearch) {
          setStartIndex((prev) => prev + resultsPerPage);
        }
      } catch (error) {
        // Don't show error if request was cancelled
        if (error.name === "AbortError") {
          return;
        }
        toast.error(
          error.message === "QUOTA_EXCEEDED"
            ? "API quota exceeded. Please try again later."
            : "Failed to perform search",
        );
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    },
    [searchQuery, startIndex],
  );

  /**
   * Debounced search callback for auto-search as user types
   * Waits 500ms after user stops typing before performing search
   * Prevents excessive API calls during rapid user input
   * @returns {void}
   */
  const debouncedSearch = useDebouncedCallback(
    () => {
      if (searchQuery.trim()) {
        setResults([]);
        setStartIndex(0);
        setHasMore(true);
        performYoutubeSearch(true);
      }
    },
    500, // 500ms delay
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

  /**
   * Handles YouTube channel request form submission
   * Validates input URL format and submits new channel request
   * @returns {Promise<void>}
   */
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

  /**
   * Handles YouTube search form submission
   * Cancels any pending debounced searches and performs immediate search
   * @param {Event} e - Form submission event
   * @returns {Promise<void>}
   */
  const handleSearch = async (e) => {
    e.preventDefault();

    // Cancel debounced search if user manually submits
    debouncedSearch.cancel();

    if (searchQuery.trim()) {
      // Mark initial load done before pushing so the ?q= useEffect doesn't
      // re-trigger a second search when it sees the new URL param.
      initialLoadDoneRef.current = true;
      router.push(`/${language}/yt-search?q=${encodeURIComponent(searchQuery.trim())}`, { scroll: false });
    }
    setStartIndex(0);
    setHasMore(true);
    await performYoutubeSearch(true);
  };

  /**
   * Handles sharing YouTube search results
   * Uses Web Share API if available, falls back to clipboard copy
   * @param {Event} e - Click event
   * @returns {void}
   */
  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Create URL with correct path, preserving the language prefix
    const url = new URL(window.location.href);
    url.pathname = `/${language}/yt-search`;
    url.searchParams.set("q", searchQuery);

    if (navigator.share) {
      navigator
        .share({
          title: translations.shareTitleFatwa || "Ilm Search Results",
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

YoutubeSearch.propTypes = {
  translations: PropTypes.object.isRequired,
  language: PropTypes.string,
};

export default YoutubeSearch;
