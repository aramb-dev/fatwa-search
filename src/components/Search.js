import React from "react";
import { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "../lib/utils";
import { Search, Plus, Filter, Share2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Dialog, DialogOverlay } from "@radix-ui/react-dialog";
import { Switch } from "../components/ui/switch";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { translations } from "../translations";

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

const modalVariants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 400,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const CustomDialogContent = ({ children, ...props }) => (
  <motion.div
    initial="initial"
    animate="animate"
    exit="exit"
    variants={overlayVariants}
    className="fixed inset-0 z-50 flex items-center justify-center"
  >
    <DialogOverlay className="fixed inset-0 bg-black/50" />
    <motion.div
      variants={modalVariants}
      className={cn(
        "relative",
        "w-full max-w-[670px]",
        "min-h-[200px]",
        "bg-white rounded-lg",
        "p-6",
        "shadow-lg",
        "mx-4 sm:mx-auto",
        "z-50",
        "overflow-y-auto max-h-[90vh]",
      )}
      {...props}
    >
      {children}
    </motion.div>
  </motion.div>
);

const DialogHeader = ({ children }) => (
  <div className="flex flex-col space-y-2 sm:space-y-3 mb-4 sm:mb-6">
    {children}
  </div>
);

const CustomDialogTitle = ({ children }) => (
  <h2 className="text-lg sm:text-xl font-semibold leading-none tracking-tight">
    {children}
  </h2>
);

const DialogFooter = ({ children }) => (
  <div
    className={cn(
      "mt-4 pt-4 sm:mt-6 sm:pt-6",
      "border-t flex flex-col-reverse sm:flex-row gap-2 sm:gap-4",
      "sm:justify-end",
    )}
  >
    {children}
  </div>
);

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

  const [searchQuery, setSearchQuery] = useState("");
  const [sites] = useState(DEFAULT_SITES);
  const [includeShamela, setIncludeShamela] = useState(false);
  const [includeAlmaany, setIncludeAlmaany] = useState(false);
  const [includeDorar, setIncludeDorar] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [setIsModalOpen] = useState(false);
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

  const performSearch = useCallback(
    async (start, isNewSearch = false) => {
      setLoading(true);
      try {
        if (
          !process.env.REACT_APP_GOOGLE_API_KEY ||
          !process.env.REACT_APP_SEARCH_ENGINE_ID
        ) {
          throw new Error("Search API credentials are not properly configured");
        }

        const regularSites = selectedSites;
        const specialSitesToSearch = [
          ...(includeShamela ? ["shamela.ws"] : []),
          ...(includeAlmaany ? ["almaany.com"] : []),
          ...(includeDorar ? ["dorar.net"] : []),
        ];

        let allResults = [];

        for (const specialSite of specialSitesToSearch) {
          const specialSearchUrl = `https://www.googleapis.com/customsearch/v1?key=${
            process.env.REACT_APP_GOOGLE_API_KEY
          }&cx=${process.env.REACT_APP_SEARCH_ENGINE_ID}&q=${encodeURIComponent(
            `site:${specialSite} ${searchQuery}`,
          )}&start=${start}`;

          const specialResponse = await fetch(specialSearchUrl);
          const specialData = await specialResponse.json();

          console.log(`Searching ${specialSite}:`, specialData);
          if (!specialData.items) {
            console.warn(`No results found for ${specialSite}`);
          }

          if (specialData.items) {
            allResults = [...allResults, ...specialData.items];
          }
        }

        if (regularSites.length > 0) {
          const regularSiteQuery = regularSites
            .map((site) => `site:${site}`)
            .join(" OR ");
          const regularSearchUrl = `https://www.googleapis.com/customsearch/v1?key=${
            process.env.REACT_APP_GOOGLE_API_KEY
          }&cx=${process.env.REACT_APP_SEARCH_ENGINE_ID}&q=${encodeURIComponent(
            `(${regularSiteQuery}) ${searchQuery}`,
          )}&start=${start}`;

          const regularResponse = await fetch(regularSearchUrl);
          const regularData = await regularResponse.json();

          if (regularData.items) {
            allResults = [...allResults, ...regularData.items];
          }
        }

        console.log("Special sites to search:", specialSitesToSearch);
        console.log(
          "Before sorting:",
          allResults.map((r) => r.link),
        );

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

        console.log(
          "After sorting:",
          allResults.map((r) => r.link),
        );

        setSearchResults((prev) => {
          if (isNewSearch) return allResults;
          return [...prev, ...allResults];
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
        console.error("Search failed:", error);
        toast.error("Search failed: " + error.message);
      } finally {
        setLoading(false);
      }
    },
    [
      searchQuery,
      selectedSites,
      includeShamela,
      includeAlmaany,
      includeDorar,
      t,
    ], // Removed translations, added t
  );

  useEffect(() => {
    const queryParam = searchParams.get("q");
    if (queryParam && !initialLoadDoneRef.current) {
      setSearchQuery(queryParam);
      initialLoadDoneRef.current = true;
      performSearch(1, true);
    }
  }, [searchParams, performSearch]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

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

  const toggleSite = (site) => {
    if (!isShiftPressed) {
      setSelectedSites([site]);
    } else {
      setSelectedSites((prev) =>
        prev.includes(site) ? prev.filter((s) => s !== site) : [...prev, site],
      );
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
        body: new URLSearchParams(formData).toString(),
      });
      setIsModalOpen(false);
      setSiteInput("");
      toast.success(t.requestSubmitted);
    } catch (error) {
      toast.error(t.requestFailed);
    }
  };

  const isMobile = () => window.innerWidth <= 768;

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
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t.searchAlmaany}</span>
                <Switch
                  checked={includeAlmaany}
                  onCheckedChange={setIncludeAlmaany}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t.searchDorar}</span>
                <Switch
                  checked={includeDorar}
                  onCheckedChange={setIncludeDorar}
                  className="data-[state=checked]:bg-green-600"
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
                placeholder={t.searchPlaceholder} // Changed this line
                className="flex-grow"
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

              {}
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="flex items-center gap-2"
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
                    >
                      <Filter className="h-4 w-4" />
                      {t.filter}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            {}
            <div className="space-y-2">
              <p className="text-sm text-gray-500 italic md:block hidden">
                {t.selectTooltip}
              </p>
              <p className="text-sm text-gray-500 italic block md:hidden">
                Tap &ldquo;Select Sites&rdquo; to choose multiple sites, or tap
                individual sites to search one at a time
              </p>

              <div className="flex flex-wrap gap-2 relative w-full">
                {}
                <div className="md:hidden w-full flex flex-wrap gap-2 mb-2">
                  <Button
                    onClick={() => setIsMobileSelecting(!isMobileSelecting)}
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0"
                  >
                    {isMobileSelecting ? "Done" : "Select Sites"}
                  </Button>
                  {isMobileSelecting && (
                    <>
                      <Button
                        onClick={() => setSelectedSites(sites)}
                        variant="outline"
                        size="sm"
                        className="flex-shrink-0"
                      >
                        Select All
                      </Button>
                      <Button
                        onClick={() => setSelectedSites([])}
                        variant="outline"
                        size="sm"
                        className="flex-shrink-0"
                      >
                        Select None
                      </Button>
                    </>
                  )}
                </div>

                {}
                <Button
                  onClick={() => setSelectedSites(sites)}
                  variant={
                    selectedSites.length === sites.length
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  type="button"
                  className={cn(
                    "md:block flex-shrink-0",
                    isMobileSelecting ? "hidden" : "block",
                  )}
                >
                  All Sites
                </Button>

                {}
                {sites.map((site) => (
                  <Button
                    key={site}
                    onClick={(e) => {
                      if (isMobile()) {
                        if (isMobileSelecting) {
                          setSelectedSites((prev) =>
                            prev.includes(site)
                              ? prev.filter((s) => s !== site)
                              : [...prev, site],
                          );
                        } else {
                          setSelectedSites([site]);
                        }
                      } else {
                        toggleSite(site, e);
                      }
                    }}
                    className={cn(
                      "transition-all duration-200 flex-shrink-0",
                      selectedSites.includes(site)
                        ? "bg-green-600 hover:bg-green-700 text-white border-2 border-green-600"
                        : "bg-white text-gray-700 hover:bg-gray-100",
                      !isMobileSelecting && "md:block",
                    )}
                    size="sm"
                    type="button"
                  >
                    {site}
                  </Button>
                ))}
              </div>
            </div>
          </form>

          {}
          <div ref={resultsContainerRef} className="mt-6 space-y-4 scroll-mt-4">
            <AnimatePresence mode="wait">
              {searchQuery && filteredResults.length > 0 ? (
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
                  className="text-center text-gray-500"
                >
                  {t.noResults}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {}
          {hasMore && searchResults.length > 0 && (
            <div className="fixed bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
              <Button
                onClick={() => performSearch(startIndex)}
                disabled={loading}
                variant="outline"
                className="w-full max-w-sm shadow-lg bg-white hover:bg-gray-50"
              >
                {loading ? t.loading : t.loadMore}
              </Button>
              <Button
                variant="outline"
                onClick={openFeedbackModal}
                className="shadow-lg bg-white hover:bg-gray-50"
              >
                {t.provideFeedback}
              </Button>
            </div>
          )}

          {}
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

          {}
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

      {}
      <AnimatePresence mode="wait">
        {}
        {activeModal === "feedback" && (
          <Dialog open={true} onOpenChange={closeModal}>
            <CustomDialogContent onClick={(e) => e.stopPropagation()}>
              <DialogHeader>
                <CustomDialogTitle>{t.provideFeedback}</CustomDialogTitle>
                <p className="text-sm text-gray-500">{t.feedbackDescription}</p>
              </DialogHeader>
              <div className="space-y-4">
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={t.feedbackPlaceholder}
                  className="w-full min-h-[100px] p-3 rounded-md border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeModal}>
                  {t.cancel}
                </Button>
                <Button
                  onClick={handleFeedbackSubmit}
                  disabled={!feedback.trim()}
                >
                  {t.feedbackSubmit}
                </Button>
              </DialogFooter>
            </CustomDialogContent>
          </Dialog>
        )}

        {}
        {activeModal === "siteRequest" && (
          <Dialog open={true} onOpenChange={closeModal}>
            <CustomDialogContent onClick={(e) => e.stopPropagation()}>
              <DialogHeader>
                <CustomDialogTitle>{t.requestNewSite}</CustomDialogTitle>
                <p className="text-sm text-gray-500">{t.enterSiteDomain}</p>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  value={siteInput}
                  onChange={(e) => setSiteInput(e.target.value)}
                  placeholder={t.siteUrlPlaceholder}
                  className="w-full"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeModal}>
                  {t.cancel}
                </Button>
                <Button onClick={handleSiteRequest}>{t.submitRequest}</Button>
              </DialogFooter>
            </CustomDialogContent>
          </Dialog>
        )}

        {/* Filter Modal */}
        {activeModal === "filter" && searchResults.length > 0 && (
          <Dialog open={true} onOpenChange={closeModal}>
            <CustomDialogContent onClick={(e) => e.stopPropagation()}>
              <DialogHeader>
                <CustomDialogTitle>{t.filterResults}</CustomDialogTitle>
                <p className="text-sm text-gray-500">{t.filterBySite}</p>
                <p className="text-xs text-gray-400 italic">{t.loadMoreTip}</p>
              </DialogHeader>
              <div className="space-y-4">
                {Array.from(
                  new Set(
                    searchResults.map(
                      (result) => new URL(result.link).hostname,
                    ),
                  ),
                ).map((site) => (
                  <div key={site} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={site}
                      checked={siteFilters.includes(site)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSiteFilters([...siteFilters, site]);
                        } else {
                          setSiteFilters(siteFilters.filter((s) => s !== site));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={site}>{site}</label>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSiteFilters([])}>
                  {t.clearFilters}
                </Button>
                <Button onClick={closeModal}>{t.close}</Button>
              </DialogFooter>
            </CustomDialogContent>
          </Dialog>
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

SearchResult.displayName = "SearchResult";

export default SearchComponent;
