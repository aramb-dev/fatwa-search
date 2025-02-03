import React from "react";
import { useState, useCallback, useEffect, useRef } from "react"; // Add useCallback and useEffect import
import { cn } from "../lib/utils";
import { Search, Plus, Filter } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Dialog, DialogOverlay } from "@radix-ui/react-dialog"; // Import DialogOverlay
import { Switch } from "../components/ui/switch";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion

// Add these animation variants
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

// Update DialogContent styling with mobile responsiveness
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
        "mx-4 sm:mx-auto", // Add horizontal margin for mobile
        "z-50", // Ensure modal is above overlay
        "overflow-y-auto max-h-[90vh]" // Handle overflow for tall content
      )}
      {...props}
    >
      {children}
    </motion.div>
  </motion.div>
);

// Update DialogHeader styling
const DialogHeader = ({ children }) => (
  <div className="flex flex-col space-y-2 sm:space-y-3 mb-4 sm:mb-6">
    {children}
  </div>
);

// Update DialogTitle styling
const CustomDialogTitle = ({ children }) => (
  <h2 className="text-lg sm:text-xl font-semibold leading-none tracking-tight">
    {children}
  </h2>
);

// Update DialogFooter styling for better mobile layout
const DialogFooter = ({ children }) => (
  <div
    className={cn(
      "mt-4 pt-4 sm:mt-6 sm:pt-6",
      "border-t flex flex-col-reverse sm:flex-row gap-2 sm:gap-4",
      "sm:justify-end"
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

const SearchComponent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sites] = useState(DEFAULT_SITES);
  const [includeShamela, setIncludeShamela] = useState(false); // Add this line
  const [includeAlmaany, setIncludeAlmaany] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [setIsModalOpen] = useState(false);
  const [siteInput, setSiteInput] = useState("");
  const [startIndex, setStartIndex] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const resultsPerPage = 10;
  const [selectedSites, setSelectedSites] = useState(sites);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isMobileSelecting, setIsMobileSelecting] = useState(false);
  const resultsContainerRef = useRef(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [siteFilters, setSiteFilters] = useState([]);
  // Add a new state for managing which modal is currently open
  const [activeModal, setActiveModal] = useState(null); // 'feedback', 'filter', or 'siteRequest'

  // Replace the individual modal state setters with this function
  const openModal = (modalName) => {
    setActiveModal(modalName);
  };

  // Replace the individual modal state closers with this function
  const closeModal = () => {
    setActiveModal(null);
  };

  // Update the button handlers
  const openFeedbackModal = () => openModal("feedback");
  const openFilterModal = () => openModal("filter");
  const openSiteRequestModal = () => openModal("siteRequest");

  // Add event listeners for shift key
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

  const toggleSite = (site, event) => {
    if (!isShiftPressed) {
      // Single selection
      setSelectedSites([site]);
    } else {
      // Multiple selection
      setSelectedSites((prev) =>
        prev.includes(site) ? prev.filter((s) => s !== site) : [...prev, site]
      );
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Reset results and start index for new search
    setSearchResults([]);
    setStartIndex(1);
    setHasMore(true);
    await performSearch(1, true);

    // Scroll to results after a small delay to ensure results are rendered
    setTimeout(() => {
      resultsContainerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 500);
  };

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

        // Separate regular sites from special sites
        const regularSites = selectedSites;
        const specialSitesToSearch = [
          ...(includeShamela ? ["shamela.ws"] : []),
          ...(includeAlmaany ? ["almaany.com"] : []),
        ];

        let allResults = [];

        // First, search special sites individually if enabled
        for (const specialSite of specialSitesToSearch) {
          const specialSearchUrl = `https://www.googleapis.com/customsearch/v1?key=${
            process.env.REACT_APP_GOOGLE_API_KEY
          }&cx=${process.env.REACT_APP_SEARCH_ENGINE_ID}&q=${encodeURIComponent(
            `site:${specialSite} ${searchQuery}`
          )}&start=${start}`;

          const specialResponse = await fetch(specialSearchUrl);
          const specialData = await specialResponse.json();

          if (specialData.items) {
            allResults = [...allResults, ...specialData.items];
          }
        }

        // Then search regular sites
        if (regularSites.length > 0) {
          const regularSiteQuery = regularSites
            .map((site) => `site:${site}`)
            .join(" OR ");
          const regularSearchUrl = `https://www.googleapis.com/customsearch/v1?key=${
            process.env.REACT_APP_GOOGLE_API_KEY
          }&cx=${process.env.REACT_APP_SEARCH_ENGINE_ID}&q=${encodeURIComponent(
            `(${regularSiteQuery}) ${searchQuery}`
          )}&start=${start}`;

          const regularResponse = await fetch(regularSearchUrl);
          const regularData = await regularResponse.json();

          if (regularData.items) {
            allResults = [...allResults, ...regularData.items];
          }
        }

        // Sort results to prioritize special sites
        allResults.sort((a, b) => {
          const aIsSpecial = specialSitesToSearch.some((site) =>
            a.link.includes(site)
          );
          const bIsSpecial = specialSitesToSearch.some((site) =>
            b.link.includes(site)
          );
          return bIsSpecial - aIsSpecial;
        });

        // Update results state
        setSearchResults((prev) => {
          if (isNewSearch) return allResults;
          return [...prev, ...allResults];
        });

        setHasMore(allResults.length >= resultsPerPage);
        setStartIndex(start + resultsPerPage);

        // After search is complete and results are set, show the toast
        if (isNewSearch) {
          toast(
            "Some websites are more prominently indexed and ranked by search engines, which means you may see a higher number of results from those sites compared to others when searching. For example: Shaykh Bin Baz (رحمه الله) may have more results than that of Shaykh Luhaydan (رحمه الله).",
            {
              duration: Infinity,
              closeButton: true,
            }
          );
        }
      } catch (error) {
        console.error("Search failed:", error);
        toast.error("Search failed: " + error.message);
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, selectedSites, includeShamela, includeAlmaany]
  );

  const handleSiteRequest = async () => {
    if (!siteInput.trim()) {
      toast.error("Please enter a site URL");
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
      toast.success("Site request submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit site request");
    }
  };

  // Add this helper function to check if device is mobile
  const isMobile = () => window.innerWidth <= 768;

  // Add this handler for feedback submission
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
            <CardTitle>Fatwa Search</CardTitle>
            <p className="text-sm text-gray-500">
              Search the Mashayikh sites for your keyword
            </p>
            <p className="text-sm text-gray-500">
              Putting your keywords in Arabic is more effective as these are
              Arabic sites
            </p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Button
              onClick={openSiteRequestModal}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Request Site
            </Button>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Search Shamela.ws</span>
                <Switch
                  checked={includeShamela}
                  onCheckedChange={setIncludeShamela}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  Search Almaany.com
                </span>
                <Switch
                  checked={includeAlmaany}
                  onCheckedChange={setIncludeAlmaany}
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
                placeholder="Enter your search query..."
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
                      "bg-gray-900 text-white hover:bg-gray-800"
                  )}
                >
                  <Search className="h-4 w-4" />
                  {loading ? "Searching..." : "Search"}
                </Button>
              </motion.div>

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
                      Filter
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            {/* Add helper text above site selection */}
            <div className="space-y-2">
              <p className="text-sm text-gray-500 italic md:block hidden">
                Hold Shift to select multiple sites, click individual sites to
                search one at a time, or click "All Sites" to search everything
              </p>
              <p className="text-sm text-gray-500 italic block md:hidden">
                Tap "Select Sites" to choose multiple sites, or tap individual
                sites to search one at a time
              </p>

              <div className="flex flex-wrap gap-2 relative w-full">
                {/* Mobile Selection  Mode Buttons */}
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

                {/* All Sites button - hidden on mobile when selecting */}
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
                    isMobileSelecting ? "hidden" : "block"
                  )}
                >
                  All Sites
                </Button>

                {/* Site buttons */}
                {sites.map((site) => (
                  <Button
                    key={site}
                    onClick={(e) => {
                      if (isMobile()) {
                        if (isMobileSelecting) {
                          // Multiple selection mode on mobile
                          setSelectedSites((prev) =>
                            prev.includes(site)
                              ? prev.filter((s) => s !== site)
                              : [...prev, site]
                          );
                        } else {
                          // Single selection mode on mobile
                          setSelectedSites([site]);
                        }
                      } else {
                        // Desktop behavior remains the same
                        toggleSite(site, e);
                      }
                    }}
                    className={cn(
                      "transition-all duration-200 flex-shrink-0",
                      selectedSites.includes(site)
                        ? "bg-green-600 hover:bg-green-700 text-white border-2 border-green-600"
                        : "bg-white text-gray-700 hover:bg-gray-100",
                      !isMobileSelecting && "md:block"
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

          {/* Search Results */}
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
                  No results found for your search
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Load More Button */}
          {hasMore && searchResults.length > 0 && (
            <div className="fixed bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
              <Button
                onClick={() => performSearch(startIndex)}
                disabled={loading}
                variant="outline"
                className="w-full max-w-sm shadow-lg bg-white hover:bg-gray-50"
              >
                {loading ? "Loading..." : "Load More Results"}
              </Button>
              <Button
                variant="outline"
                onClick={openFeedbackModal}
                className="shadow-lg bg-white hover:bg-gray-50"
              >
                Provide Feedback
              </Button>
            </div>
          )}

          {/* Add this before the attribution footer */}
          <div className="mt-8 border-t pt-8">
            <div className="flex flex-col items-center space-y-4">
              <Button
                variant="outline"
                size="sm"
                onClick={openFeedbackModal}
                className="text-sm"
              >
                {showFeedback ? "Close Feedback" : "Provide Feedback"}
              </Button>

              {showFeedback && (
                <div className="w-full max-w-md space-y-4">
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Tell us what you think about the search..."
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
                      Cancel
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

          {/* Add attribution footer */}
          <div className="mt-4 text-center text-sm text-gray-500">
            Created by{" "}
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
              View on GitHub
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Add new feedback modal */}
      <AnimatePresence mode="wait">
        {/* Feedback Modal */}
        {activeModal === "feedback" && (
          <Dialog open={true} onOpenChange={closeModal}>
            <CustomDialogContent onClick={(e) => e.stopPropagation()}>
              <DialogHeader>
                <CustomDialogTitle>Provide Feedback</CustomDialogTitle>
                <p className="text-sm text-gray-500">
                  Help us improve by sharing your thoughts about the search
                  experience.
                </p>
              </DialogHeader>
              <div className="space-y-4">
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us what you think about the search..."
                  className="w-full min-h-[100px] p-3 rounded-md border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button
                  onClick={handleFeedbackSubmit}
                  disabled={!feedback.trim()}
                >
                  Submit Feedback
                </Button>
              </DialogFooter>
            </CustomDialogContent>
          </Dialog>
        )}

        {/* Site Request Modal */}
        {activeModal === "siteRequest" && (
          <Dialog open={true} onOpenChange={closeModal}>
            <CustomDialogContent onClick={(e) => e.stopPropagation()}>
              <DialogHeader>
                <CustomDialogTitle>Request New Site</CustomDialogTitle>
                <p className="text-sm text-gray-500">
                  Enter the domain of the site you'd like to include in the
                  search.
                </p>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  value={siteInput}
                  onChange={(e) => setSiteInput(e.target.value)}
                  placeholder="Enter site URL (e.g., example.com)"
                  className="w-full"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button onClick={handleSiteRequest}>Submit Request</Button>
              </DialogFooter>
            </CustomDialogContent>
          </Dialog>
        )}

        {/* Filter Modal */}
        {activeModal === "filter" && searchResults.length > 0 && (
          <Dialog open={true} onOpenChange={closeModal}>
            <CustomDialogContent onClick={(e) => e.stopPropagation()}>
              <DialogHeader>
                <CustomDialogTitle>Filter Results</CustomDialogTitle>
                <p className="text-sm text-gray-500">Filter results by site</p>
                <p className="text-xs text-gray-400 italic">
                  Click the "Load More" button to filter more sites
                </p>
              </DialogHeader>
              <div className="space-y-4">
                {Array.from(
                  new Set(
                    searchResults.map((result) => new URL(result.link).hostname)
                  )
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
                  Clear Filters
                </Button>
                <Button onClick={closeModal}>Close</Button>
              </DialogFooter>
            </CustomDialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
};

const SearchResult = React.memo(({ result, index, isNewResult }) => {
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
