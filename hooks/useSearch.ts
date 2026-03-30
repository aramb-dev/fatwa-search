"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { searchCache } from "../lib/cache";
import {
  DEFAULT_SITES,
  ENGLISH_SITES,
  RESULTS_PER_PAGE,
} from "../lib/constants";
import type { Language, SearchMode, SearchResultItem, Translation } from "../lib/types";

interface UseSearchOptions {
  language: Language;
  t: Translation;
}

interface UseSearchReturn {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: SearchResultItem[];
  loading: boolean;
  hasMore: boolean;
  hasSearched: boolean;
  startIndex: number;
  selectedSites: string[];
  setSelectedSites: (sites: string[]) => void;
  siteFilters: string[];
  setSiteFilters: (filters: string[]) => void;
  searchMode: SearchMode;
  setSearchMode: (mode: SearchMode) => void;
  sites: string[];
  filteredResults: SearchResultItem[];
  siteInput: string;
  setSiteInput: (v: string) => void;
  feedback: string;
  setFeedback: (v: string) => void;
  activeModal: string | null;
  openModal: (name: string) => void;
  closeModal: () => void;
  showV3Modal: boolean;
  setShowV3Modal: (v: boolean) => void;
  handleSearch: (e: React.FormEvent) => Promise<void>;
  handleReset: () => void;
  handleShare: (e: React.MouseEvent) => void;
  handleSiteRequest: () => Promise<void>;
  handleFeedbackSubmit: () => Promise<void>;
  performSearch: (start: number, isNewSearch?: boolean, queryOverride?: string) => Promise<void>;
}

export function useSearch({ language, t }: UseSearchOptions): UseSearchReturn {
  const isEnglish = language === "en";
  const sitesForLanguage = isEnglish ? ENGLISH_SITES : DEFAULT_SITES;

  const [searchQuery, setSearchQuery] = useState("");
  const [sites] = useState<string[]>(sitesForLanguage);
  const [searchMode, setSearchMode] = useState<SearchMode>("scholars");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [siteInput, setSiteInput] = useState("");
  const [startIndex, setStartIndex] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedSites, setSelectedSites] = useState<string[]>(sitesForLanguage);
  const [siteFilters, setSiteFilters] = useState<string[]>([]);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showV3Modal, setShowV3Modal] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  const initialLoadDoneRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("v3-announced")) {
      setShowV3Modal(true);
    }
  }, []);

  const getErrorMessage = useCallback((error: Error): string => {
    const msg = error.message.toLowerCase();
    if (msg.includes("failed to fetch") || msg.includes("network")) return t.errorNetwork;
    if (msg.includes("quota") || msg.includes("limit")) return t.errorQuota;
    if (msg.includes("timeout") || msg.includes("aborted")) return t.errorTimeout;
    if (msg.includes("invalid") || msg.includes("bad request")) return t.errorInvalid;
    return t.errorGeneric;
  }, [t]);

  const performSearch = useCallback(
    async (start: number, isNewSearch = false, queryOverride?: string) => {
      const activeQuery = queryOverride !== undefined ? queryOverride : searchQuery;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      setLoading(true);
      try {
        const libraryDomains: Record<string, string> = {
          shamela: "shamela.ws",
          dorar: "dorar.net",
          almaany: "almaany.com",
        };

        const cacheKey = { query: activeQuery, mode: searchMode, sites: selectedSites, start };
        const cachedResults = searchCache.get(cacheKey) as SearchResultItem[] | null;

        if (cachedResults && isNewSearch) {
          setSearchResults(cachedResults);
          setHasMore(cachedResults.length >= RESULTS_PER_PAGE);
          setStartIndex(start + RESULTS_PER_PAGE);
          setLoading(false);
          return;
        }

        let allResults: SearchResultItem[] = [];

        if (searchMode !== "scholars") {
          const domain = libraryDomains[searchMode];
          const response = await fetch(
            `/api/search?q=${encodeURIComponent(activeQuery)}&site=${domain}&start=${start}&lang=${language}`,
            { signal },
          );
          const data = await response.json();
          if (data.error) throw new Error(data.error);
          allResults = data.items || [];
        } else {
          if (selectedSites.length > 0) {
            const regularSiteQuery = selectedSites.map((site) => `site:${site}`).join(" OR ");
            const combinedQuery = `(${regularSiteQuery}) ${activeQuery}`;
            const response = await fetch(
              `/api/search?q=${encodeURIComponent(combinedQuery)}&start=${start}&lang=${language}`,
              { signal },
            );
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            allResults = data.items || [];
          }
        }

        setSearchResults((prev) => {
          const newResults = isNewSearch ? allResults : [...prev, ...allResults];
          if (isNewSearch && allResults.length > 0) {
            searchCache.set(cacheKey, allResults);
          }
          return newResults;
        });

        setHasMore(allResults.length >= RESULTS_PER_PAGE);
        setStartIndex(start + RESULTS_PER_PAGE);

        if (isNewSearch && searchMode === "scholars" && !localStorage.getItem("disclaimer-shown")) {
          localStorage.setItem("disclaimer-shown", "1");
          toast(t.searchResultsDisclaimer, { duration: 5000, closeButton: true });
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        console.error("Search failed:", error);
        toast.error(getErrorMessage(error as Error), { duration: 7000, closeButton: true });
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    },
    [searchQuery, selectedSites, searchMode, language, t, getErrorMessage],
  );

  useEffect(() => {
    const queryParam = searchParams?.get("q");
    if (!queryParam && initialLoadDoneRef.current) {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      setSearchQuery("");
      setSearchResults([]);
      setSearchMode("scholars");
      setHasSearched(false);
      setStartIndex(1);
      setHasMore(true);
      setSiteFilters([]);
      initialLoadDoneRef.current = false;
      return;
    }
    if (queryParam && !initialLoadDoneRef.current) {
      setSearchQuery(queryParam);
      initialLoadDoneRef.current = true;
      setHasSearched(true);
      performSearch(1, true, queryParam);
    }
  }, [searchParams, performSearch]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    initialLoadDoneRef.current = true;
    router.push(`/${language}/search?q=${encodeURIComponent(searchQuery.trim())}`, { scroll: false });
    setHasSearched(true);
    setSearchResults([]);
    setStartIndex(1);
    setHasMore(true);
    await performSearch(1, true);
  };

  const handleReset = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setSearchQuery("");
    setSearchResults([]);
    setSearchMode("scholars");
    setHasSearched(false);
    setStartIndex(1);
    setHasMore(true);
    setSiteFilters([]);
    router.push(`/${language}/search`, { scroll: false });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = new URL(window.location.href);
    url.searchParams.set("q", searchQuery);
    if (navigator.share) {
      navigator
        .share({ title: t.shareTitleFatwa, text: `${t.shareText} "${searchQuery}"`, url: url.toString() })
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(url.toString());
      toast.success(t.linkCopied);
    }
  };

  const handleSiteRequest = async () => {
    if (!siteInput.trim()) {
      toast.error(t.pleaseEnterSite);
      return;
    }
    const formData = new FormData();
    formData.append("form-name", "site-request");
    formData.append("requested-site", siteInput);
    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData as unknown as Record<string, string>).toString(),
      });
      setSiteInput("");
      setActiveModal(null);
      toast.success(t.requestSubmitted);
    } catch {
      toast.error(t.requestFailed);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) {
      toast.error(t.pleaseEnterFeedback);
      return;
    }
    const formData = new FormData();
    formData.append("form-name", "feedback");
    formData.append("feedback", feedback);
    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData as unknown as Record<string, string>).toString(),
      });
      setFeedback("");
      setActiveModal(null);
      toast.success(t.feedbackSuccess);
    } catch {
      toast.error(t.feedbackFailed);
    }
  };

  const filteredResults = searchResults.filter((result) => {
    if (siteFilters.length === 0) return true;
    return siteFilters.some((site) => result.link.includes(site));
  });

  const openModal = (name: string) => setActiveModal(name);
  const closeModal = () => setActiveModal(null);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    loading,
    hasMore,
    hasSearched,
    startIndex,
    selectedSites,
    setSelectedSites,
    siteFilters,
    setSiteFilters,
    searchMode,
    setSearchMode,
    sites,
    filteredResults,
    siteInput,
    setSiteInput,
    feedback,
    setFeedback,
    activeModal,
    openModal,
    closeModal,
    showV3Modal,
    setShowV3Modal,
    handleSearch,
    handleReset,
    handleShare,
    handleSiteRequest,
    handleFeedbackSubmit,
    performSearch,
  };
}
