import React from "react";
import { useState, useCallback, useEffect, useRef } from "react";
import { Search, Plus, Filter, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Skeleton } from "./ui/skeleton";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { translations } from "../translations";
import { FeedbackModal } from "./search/FeedbackModal";
import { SiteRequestModal } from "./search/SiteRequestModal";
import { FilterModal } from "./search/FilterModal";
import { SiteFilters } from "./search/SiteFilters";
import { searchCache } from "../lib/cache";
import PropTypes from "prop-types";
import { cn } from "../lib/utils";

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
  initial: { scale: 1 },
};

const resultsVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const filterVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const DEFAULT_SITES = [
  "binothaimeen.net",
  "alfawzan.af.org.sa",
  "lohaidan.af.org.sa",
  "binbaz.org.sa",
  "al-badr.net",
  "obied-aljabri.com",
  "aletioupi.com",
  "miraath.net",
  "al-albany.com",
  "rabee.net",
];

const SearchComponent = ({ language = "en" }) => {
  let t = translations[language];

  if (!t) {
    console.error("Missing translations for language:", language);
    t = translations.en;
  }

  const resultsPerPage = 10;

  /**
   * Provides user-friendly, actionable error messages based on error type
   * @param {Error} error - The error object
   * @returns {string} - User-friendly error message
   */
  const getErrorMessage = (error) => {
    const errorMessage = error.message.toLowerCase();

    // Network errors
    if (errorMessage.includes('failed to fetch') || errorMessage.includes('network')) {
      return "Network error. Please check your internet connection and try again.";
    }

    // Quota exceeded
    if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
      return "Search quota exceeded. Please try again in a few minutes.";
    }

    // Timeout errors
    if (errorMessage.includes('timeout') || errorMessage.includes('aborted')) {
      return "Search timed out. Please try again with different keywords.";
    }

    // Invalid query
    if (errorMessage.includes('invalid') || errorMessage.includes('bad request')) {
      return "Invalid search query. Please try different keywords.";
    }

    // Generic fallback with helpful suggestion
    return `Search failed. Please try again or contact support if the problem persists.`;
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [sites] = useState(DEFAULT_SITES);
  const [includeShamela, setIncludeShamela] = useState(false);
  const [includeAlmaany, setIncludeAlmaany] = useState(false);
  const [includeDorar, setIncludeDorar] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [siteInput, setSiteInput] = useState("");
  const [startIndex, setStartIndex] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedSites, setSelectedSites] = useState(sites);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isMobileSelecting, setIsMobileSelecting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [siteFilters, setSiteFilters] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [searchParams] = useSearchParams();

  const initialLoadDoneRef = useRef(false);
  const resultsContainerRef = useRef(null);
  const abortControllerRef = useRef(null);

  const performSearch = useCallback(
    async (start, isNewSearch = false) => {
      // Cancel previous request if still running
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new AbortController for this request
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      setLoading(true);
      try {
        const regularSites = selectedSites;
        const specialSitesToSearch = [
          ...(includeShamela ? ["shamela.ws"] : []),
          ...(includeAlmaany ? ["almaany.com"] : []),
          ...(includeDorar ? ["dorar.net"] : []),
        ];

        // Check cache first
        const cacheKey = {
          query: searchQuery,
          sites: regularSites,
          special: specialSitesToSearch,
          start,
        };
        const cachedResults = searchCache.get(cacheKey);

        if (cachedResults && isNewSearch) {
          setSearchResults(cachedResults);
          setHasMore(cachedResults.length >= resultsPerPage);
          setStartIndex(start + resultsPerPage);
          setLoading(false);
          toast(t.searchResultsDisclaimer, {
            duration: 5000,
            closeButton: true,
          });
          return;
        }

        let allResults = [];

        // Search special sites in parallel
        const specialSearches = specialSitesToSearch.map(async (specialSite) => {
          const response = await fetch(
            `/api/search?q=${encodeURIComponent(searchQuery)}&site=${specialSite}&start=${start}`,
            { signal }
          );
          const data = await response.json();

          if (data.error) {
            console.error(`Search error for ${specialSite}:`, data.error);
            return [];
          }

          return data.items || [];
        });

        const specialResults = await Promise.all(specialSearches);
        allResults = specialResults.flat();

        // Search regular sites
        if (regularSites.length > 0) {
          const regularSiteQuery = regularSites
            .map((site) => `site:${site}`)
            .join(" OR ");

          const regularResponse = await fetch(
            `/api/search?q=${encodeURIComponent(`(${regularSiteQuery}) ${searchQuery}`)}&start=${start}`,
            { signal }
          );
          const regularData = await regularResponse.json();

          if (regularData.error) {
            console.error('Search error:', regularData.error);
            throw new Error(regularData.error);
          }

          if (regularData.items) {
            allResults = [...allResults, ...regularData.items];
          }
        }

        allResults.sort((a, b) => {
          const aIsDorar = a.link.includes("dorar.net");
          const bIsDorar = b.link.includes("dorar.net");
          if (aIsDorar && !bIsDorar) return -1;
          if (!aIsDorar && bIsDorar) return 1;

          const aIsSpecial = specialSitesToSearch.some((site) =>
            a.link.includes(site),
          );
          const bIsSpecial = specialSitesToSearch.some((site) =>
            b.link.includes(site),
          );
          return bIsSpecial - aIsSpecial;
        });

        setSearchResults((prev) => {
          const newResults = isNewSearch ? allResults : [...prev, ...allResults];

          // Cache the results for new searches only
          if (isNewSearch && allResults.length > 0) {
            searchCache.set(cacheKey, allResults);
          }

          return newResults;
        });

        setHasMore(allResults.length >= resultsPerPage);
        setStartIndex(start + resultsPerPage);

        if (isNewSearch) {
          toast(t.searchResultsDisclaimer, {
            duration: 5000,
            closeButton: true,
          });
        }
      } catch (error) {
        // Don't show error if request was cancelled
        if (error.name === 'AbortError') {
          return;
        }
        console.error("Search failed:", error);
        toast.error(getErrorMessage(error), {
          duration: 7000,
          closeButton: true,
        });
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    },
    [
      searchQuery,
      selectedSites,
      includeShamela,
      includeAlmaany,
      includeDorar,
      t,
    ],
  );

  // Debounced search for auto-search as you type (optional future feature)
  const debouncedSearch = useDebouncedCallback(
    () => {
      if (searchQuery.trim()) {
        setSearchResults([]);
        setStartIndex(1);
        setHasMore(true);
        performSearch(1, true);
      }
    },
    500 // 500ms delay
  );

  useEffect(() => {
    const queryParam = searchParams?.get("q");
    if (queryParam && !initialLoadDoneRef.current) {
      setSearchQuery(queryParam);
      initialLoadDoneRef.current = true;
      performSearch(1, true);
    }
  }, [searchParams, performSearch]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Cancel debounced search if user manually submits
    debouncedSearch.cancel();

    setSearchResults([]);
    setStartIndex(1);
    setHasMore(true);
    await performSearch(1, true);
  };

  const openModal = (modalName) => {
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const openFeedbackModal = () => openModal("feedback");
  const openFilterModal = () => openModal("filter");
  const openSiteRequestModal = () => openModal("siteRequest");

  useEffect(() => {
    const handleKeyDown = (e) => e.shiftKey && setIsShiftPressed(true);
    const handleKeyUp = (e) => !e.shiftKey && setIsShiftPressed(false);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

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
        body: new URLSearchParams(formData).toString(),
      });
      setSiteInput("");
      closeModal();
      toast.success(t.requestSubmitted);
    } catch (error) {
      toast.error(t.requestFailed);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    const formData = new FormData();
    formData.append("form-name", "feedback");
    formData.append("feedback", feedback);

    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString(),
      });
      setShowFeedback(false);
      setFeedback("");
      closeModal();
      toast.success("Thank you for your feedback!");
    } catch (error) {
      toast.error("Failed to submit feedback");
    }
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const url = new URL(window.location.href);
    url.searchParams.set("q", searchQuery);

    if (navigator.share) {
      navigator
        .share({
          title: "Fatwa Search Results",
          text: `Check out these search results for "${searchQuery}"`,
          url: url.toString(),
        })
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(url.toString());
      toast.success("Link copied to clipboard!");
    }
  };

  const filteredResults = searchResults.filter((result) => {
    if (siteFilters.length === 0) return true;
    return siteFilters.some((site) => result.link.includes(site));
  });

  return (
    <>
      <Toaster position="top-center" />
      <Card className="w-full max-w-6xl mx-auto mb-16">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t.searchLabel}</CardTitle>
            <p className="text-sm text-gray-500">{t.searchDescription}</p>
            <p className="text-sm text-gray-500">{t.arabicTip}</p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Button
              onClick={openSiteRequestModal}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              aria-label={t.requestSite || "Request to add a new site"}
            >
              <Plus className="h-4 w-4" />
              {t.requestSite}
            </Button>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t.searchShamela}</span>
                <Switch
                  checked={includeShamela}
                  onCheckedChange={setIncludeShamela}
                  className="data-[state=checked]:bg-green-600"
                  aria-label={t.searchShamela || "Include Shamela in search"}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t.searchAlmaany}</span>
                <Switch
                  checked={includeAlmaany}
                  onCheckedChange={setIncludeAlmaany}
                  className="data-[state=checked]:bg-green-600"
                  aria-label={t.searchAlmaany || "Include Almaany in search"}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t.searchDorar}</span>
                <Switch
                  checked={includeDorar}
                  onCheckedChange={setIncludeDorar}
                  className="data-[state=checked]:bg-green-600"
                  aria-label={t.searchDorar || "Include Dorar in search"}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <motion.div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="flex-grow"
                aria-label={t.searchPlaceholder || "Search Islamic scholars"}
                type="search"
              />
              <motion.div
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "flex items-center gap-2",
                    searchQuery.trim() &&
                      "bg-gray-900 text-white hover:bg-gray-800",
                  )}
                >
                  <Search className="h-4 w-4" />
                  {loading ? t.searching : t.searchAction}
                </Button>
              </motion.div>

              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="flex items-center gap-2"
                  aria-label={`${t.share || "Share"} search results for "${searchQuery}"`}
                >
                  <Share2 className="h-4 w-4" />
                  {t.share}
                </Button>
              )}

              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div
                    variants={filterVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      onClick={openFilterModal}
                      className="flex items-center gap-2"
                      aria-label={`${t.filter || "Filter"} results by site (${searchResults.length} results)`}
                    >
                      <Filter className="h-4 w-4" />
                      {t.filter}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <SiteFilters
              sites={sites}
              selectedSites={selectedSites}
              setSelectedSites={setSelectedSites}
              isShiftPressed={isShiftPressed}
              isMobileSelecting={isMobileSelecting}
              setIsMobileSelecting={setIsMobileSelecting}
              translations={t}
            />
          </form>

          <div ref={resultsContainerRef} className="mt-6 space-y-4 scroll-mt-4">
            <AnimatePresence mode="wait">
              {loading && searchQuery ? (
                <motion.div
                  className="space-y-4"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={resultsVariants}
                >
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg bg-white shadow-sm space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  ))}
                </motion.div>
              ) : searchQuery && filteredResults.length > 0 ? (
                <motion.div
                  className="space-y-4"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={resultsVariants}
                >
                  {filteredResults.map((result, index) => (
                    <SearchResult
                      key={result.link}
                      result={result}
                      index={index}
                      isNewResult={
                        index >= filteredResults.length - resultsPerPage
                      }
                    />
                  ))}
                </motion.div>
              ) : searchQuery && !loading ? (
                <motion.div
                  variants={resultsVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="text-center py-12"
                >
                  <div className="max-w-md mx-auto">
                    <div className="mb-4">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t.noResults}
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Try adjusting your search or selecting different sites
                    </p>
                    <div className="space-y-2 text-left bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">Suggestions:</p>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                        <li>Check your spelling</li>
                        <li>Try different or more general keywords</li>
                        <li>Select more sites to search</li>
                        <li>
                          <button
                            onClick={openSiteRequestModal}
                            className="text-blue-600 hover:underline"
                          >
                            Request a new site
                          </button> to be added
                        </li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {hasMore && searchResults.length > 0 && (
            <div className="fixed bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
              <Button
                onClick={() => performSearch(startIndex)}
                disabled={loading}
                variant="outline"
                className="w-full max-w-sm shadow-lg bg-white hover:bg-gray-50"
                aria-label={`${t.loadMore || "Load more"} search results (currently showing ${searchResults.length} results)`}
              >
                {loading ? t.loading : t.loadMore}
              </Button>
              <Button
                variant="outline"
                onClick={openFeedbackModal}
                className="shadow-lg bg-white hover:bg-gray-50"
                aria-label={t.provideFeedback || "Provide feedback"}
              >
                {t.provideFeedback}
              </Button>
            </div>
          )}

          <div className="mt-8 border-t pt-8">
            <div className="flex flex-col items-center space-y-4">
              <Button
                variant="outline"
                size="sm"
                onClick={openFeedbackModal}
                className="text-sm"
              >
                {showFeedback ? t.closeFeedback : t.provideFeedback}
              </Button>

              {showFeedback && (
                <div className="w-full max-w-md space-y-4">
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder={t.feedbackPlaceholder}
                    className="w-full min-h-[100px] p-3 rounded-md border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-200"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowFeedback(false);
                        setFeedback("");
                      }}
                    >
                      {t.cancel}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleFeedbackSubmit}
                      disabled={!feedback.trim()}
                    >
                      Submit Feedback
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-gray-500">
            {t.createdBy}{" "}
            <a
              href="https://github.com/aramb-dev"
              className="underline hover:text-gray-700"
              target="_blank"
              rel="noreferrer"
            >
              عبد من عباد الله
            </a>
            {" | "}
            <a
              href="https://github.com/aramb-dev/fatwa-search"
              className="underline hover:text-gray-700"
              target="_blank"
              rel="noreferrer"
            >
              {t.viewOnGithub}
            </a>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        <FeedbackModal
          isOpen={activeModal === "feedback"}
          onClose={closeModal}
          feedback={feedback}
          setFeedback={setFeedback}
          onSubmit={handleFeedbackSubmit}
          translations={t}
        />

        <SiteRequestModal
          isOpen={activeModal === "siteRequest"}
          onClose={closeModal}
          siteInput={siteInput}
          setSiteInput={setSiteInput}
          onSubmit={handleSiteRequest}
          translations={t}
        />

        {searchResults.length > 0 && (
          <FilterModal
            isOpen={activeModal === "filter"}
            onClose={closeModal}
            searchResults={searchResults}
            siteFilters={siteFilters}
            setSiteFilters={setSiteFilters}
            translations={t}
          />
        )}
      </AnimatePresence>
    </>
  );
};

const SearchResult = React.memo(({ result, isNewResult }) => {
  return (
    <motion.div
      key={result.link}
      initial={isNewResult ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: isNewResult ? 0.1 : 0 }}
      className="p-4 border rounded-lg bg-white shadow-sm"
    >
      <a
        href={result.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline block font-medium"
      >
        {result.title}
      </a>
      <p className="text-sm text-gray-600 mt-2">{result.snippet}</p>
      <p className="text-xs text-gray-400 mt-1">
        {new URL(result.link).hostname}
      </p>
    </motion.div>
  );
});

SearchResult.propTypes = {
  result: PropTypes.shape({
    link: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    snippet: PropTypes.string.isRequired,
  }).isRequired,
  isNewResult: PropTypes.bool,
};

SearchResult.displayName = "SearchResult";

export default SearchComponent;
