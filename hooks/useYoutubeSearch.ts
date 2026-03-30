"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import { youtubeCache } from "../lib/cache";
import { ARABIC_CHANNELS, RESULTS_PER_PAGE } from "../lib/constants";
import type { Language, VideoItem, Translation } from "../lib/types";

interface UseYoutubeSearchOptions {
  language: Language;
  t: Translation;
}

interface UseYoutubeSearchReturn {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  results: VideoItem[];
  filteredResults: VideoItem[];
  loading: boolean;
  hasMore: boolean;
  startIndex: number;
  selectedVideo: VideoItem | null;
  setSelectedVideo: (v: VideoItem | null) => void;
  channelRequest: string;
  setChannelRequest: (v: string) => void;
  channelFilters: string[];
  setChannelFilters: (f: string[]) => void;
  activeModal: string | null;
  setActiveModal: (m: string | null) => void;
  handleSearch: (e: React.FormEvent) => Promise<void>;
  handleShare: (e: React.MouseEvent) => void;
  handleChannelRequest: () => Promise<void>;
  performYoutubeSearch: (isNewSearch?: boolean) => Promise<void>;
  debouncedSearch: ((...args: unknown[]) => void) & { cancel: () => void };
}

export function useYoutubeSearch({ language, t }: UseYoutubeSearchOptions): UseYoutubeSearchReturn {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<VideoItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [channelRequest, setChannelRequest] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [startIndex, setStartIndex] = useState(0);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [channelFilters, setChannelFilters] = useState<string[]>([]);

  const searchParams = useSearchParams();
  const router = useRouter();

  const initialLoadDoneRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const performYoutubeSearch = useCallback(
    async (isNewSearch = false) => {
      const currentQuery = searchQuery.trim();
      if (!currentQuery) return;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
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
          isNewSearch ? RESULTS_PER_PAGE : startIndex + RESULTS_PER_PAGE,
        );

        const cacheKey = {
          query: currentQuery,
          channels: channelsToSearch,
          startIndex: isNewSearch ? 0 : startIndex,
        };
        const cachedResults = youtubeCache.get(cacheKey) as VideoItem[] | null;

        if (cachedResults && isNewSearch) {
          setResults(cachedResults);
          setHasMore(startIndex + RESULTS_PER_PAGE < ARABIC_CHANNELS.length);
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
            console.error(`YouTube search error for channel ${channelId}:`, data.error);
            return [] as VideoItem[];
          }

          return (data.items || []) as VideoItem[];
        });

        const newResults = (await Promise.all(searches)).flat();
        newResults.sort(
          (a, b) => new Date(b.snippet.publishedAt).getTime() - new Date(a.snippet.publishedAt).getTime(),
        );

        setResults((prev) => {
          const finalResults = isNewSearch ? newResults : [...prev, ...newResults];
          if (isNewSearch && newResults.length > 0) {
            youtubeCache.set(cacheKey, newResults);
          }
          return finalResults;
        });

        setHasMore(startIndex + RESULTS_PER_PAGE < ARABIC_CHANNELS.length);
        if (!isNewSearch) {
          setStartIndex((prev) => prev + RESULTS_PER_PAGE);
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        toast.error(
          (error as Error).message === "QUOTA_EXCEEDED"
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

  const debouncedSearch = useDebouncedCallback(() => {
    if (searchQuery.trim()) {
      setResults([]);
      setStartIndex(0);
      setHasMore(true);
      performYoutubeSearch(true);
    }
  }, 500);

  useEffect(() => {
    const queryParam = searchParams?.get("q");
    if (queryParam && !initialLoadDoneRef.current) {
      setSearchQuery(queryParam);
      initialLoadDoneRef.current = true;
      setTimeout(() => {
        performYoutubeSearch(true);
      }, 0);
    }
  }, [searchParams, performYoutubeSearch]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    debouncedSearch.cancel();
    if (searchQuery.trim()) {
      initialLoadDoneRef.current = true;
      router.push(`/${language}/yt-search?q=${encodeURIComponent(searchQuery.trim())}`, { scroll: false });
    }
    setStartIndex(0);
    setHasMore(true);
    await performYoutubeSearch(true);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = new URL(window.location.href);
    url.pathname = `/${language}/yt-search`;
    url.searchParams.set("q", searchQuery);
    if (navigator.share) {
      navigator
        .share({
          title: t.shareTitleFatwa,
          text: `Check out these YouTube search results for "${searchQuery}"`,
          url: url.toString(),
        })
        .catch(() => {
          navigator.clipboard.writeText(url.toString());
          toast.success(t.linkCopied);
        });
    } else {
      navigator.clipboard.writeText(url.toString());
      toast.success(t.linkCopied);
    }
  };

  const handleChannelRequest = async () => {
    if (!channelRequest.trim()) {
      toast.error("Please enter a YouTube channel URL");
      return;
    }
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
        body: new URLSearchParams(formData as unknown as Record<string, string>).toString(),
      });
      toast.success("Channel request submitted successfully!");
      setChannelRequest("");
      setActiveModal(null);
    } catch {
      toast.error("Failed to submit channel request");
    }
  };

  const filteredResults = results.filter((result) => {
    if (channelFilters.length === 0) return true;
    return channelFilters.includes(result.snippet.channelId);
  });

  return {
    searchQuery,
    setSearchQuery,
    results,
    filteredResults,
    loading,
    hasMore,
    startIndex,
    selectedVideo,
    setSelectedVideo,
    channelRequest,
    setChannelRequest,
    channelFilters,
    setChannelFilters,
    activeModal,
    setActiveModal,
    handleSearch,
    handleShare,
    handleChannelRequest,
    performYoutubeSearch,
    debouncedSearch,
  };
}
