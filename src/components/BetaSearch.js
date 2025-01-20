import React, { useState, useCallback, useEffect, useRef } from "react"; // Add useCallback and useEffect import
import { cn } from "../lib/utils";
import { Search, Plus } from "lucide-react";
import { DEFAULT_SITES } from "./CustomSearch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Dialog, DialogOverlay } from "@radix-ui/react-dialog"; // Import DialogOverlay

// Update DialogContent styling with mobile responsiveness
const CustomDialogContent = ({ children, ...props }) => (
  <DialogOverlay className="bg-black/50 fixed inset-0 flex items-center justify-center p-4">
    <div
      className={cn(
        // Base styles
        "relative w-full bg-white rounded-lg shadow-[0_0_40px_8px_rgba(0,0,0,0.15)]",
        // Mobile first padding
        "p-4",
        // Desktop padding
        "sm:p-6",
        // Width constraints
        "max-w-[670px] min-h-[200px]",
        // Mobile positioning
        "mx-auto",
        // Desktop positioning
        "sm:fixed sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%]",
        // Extra space for content
        "space-y-4 sm:space-y-6"
      )}
      {...props}
    >
      {children}
    </div>
  </DialogOverlay>
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

const BetaSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sites] = useState(DEFAULT_SITES); // Remove unused setSites
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const MAX_RESULTS = 100; // Google CSE limit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [siteInput, setSiteInput] = useState("");
  const [startIndex, setStartIndex] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const resultsPerPage = 10;
  const [selectedSites, setSelectedSites] = useState(sites); // Initialize with all sites
  const [isShiftPressed, setIsShiftPressed] = useState(false); // Add state for shift key tracking
  const [loadedCounts, setLoadedCounts] = useState({}); // Add state for tracking loaded results per site
  const RESULTS_PER_SITE = 5; // Add these constants at the top of BetaSearch component
  const [isMobileSelecting, setIsMobileSelecting] = useState(false); // Add this state for tracking mobile selection mode
  const resultsContainerRef = useRef(null); // Add a ref for the results container

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
        // Only use selected sites in query
        const siteQuery = selectedSites
          .map((site) => `site:${site}`)
          .join(" OR ");

        const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${
          process.env.REACT_APP_GOOGLE_API_KEY
        }&cx=${process.env.REACT_APP_SEARCH_ENGINE_ID}&q=${encodeURIComponent(
          `(${siteQuery}) ${searchQuery}`
        )}&start=${start}`;

        const response = await fetch(searchUrl);
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error.message);
        }

        const newResults = data.items || [];
        setSearchResults((prev) =>
          isNewSearch ? newResults : [...prev, ...newResults]
        );

        const totalResults = parseInt(data.searchInformation.totalResults) || 0;
        setHasMore(
          start + resultsPerPage < Math.min(totalResults, MAX_RESULTS)
        );
        setStartIndex(start + resultsPerPage);
      } catch (error) {
        console.error("Search failed:", error);
        alert("Search failed: " + error.message);
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, selectedSites]
  ); // Update dependencies

  const handleSiteRequest = async () => {
    if (!siteInput.trim()) return;

    const formData = new FormData();
    formData.append("form-name", "site-request"); // Add this line
    formData.append("requested-site", siteInput);

    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString(),
      });
      setIsModalOpen(false);
      setSiteInput("");
      alert("Site request submitted successfully!");
    } catch (error) {
      alert("Error submitting request: " + error);
    }
  };

  const LoadMoreButton = () =>
    hasMore &&
    searchResults.length > 0 && (
      <div className="flex justify-center mt-6">
        <Button
          onClick={() => performSearch(startIndex)}
          disabled={loading}
          variant="outline"
          className="w-full max-w-sm"
        >
          {loading ? "Loading..." : "Load More Results"}
        </Button>
      </div>
    );

  const handleLoadMore = (site) => {
    setLoadedCounts((prev) => ({
      ...prev,
      [site]: (prev[site] || RESULTS_PER_SITE) + RESULTS_PER_SITE,
    }));
  };

  // Add this helper function to check if device is mobile
  const isMobile = () => window.innerWidth <= 768;

  return (
    <>
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Fatwa Search</CardTitle>
            <p className="text-sm text-gray-500">
              Searches the Mashayikh sites for your keyword
            </p>
            <p className="text-sm text-gray-500">
              Putting your keywords in Arabic is more effective as these are
              Arabic sites
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Request Site
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter your search query..."
                className="flex-grow"
              />
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
            </div>
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

              <div className="flex flex-wrap gap-2 relative">
                {/* Mobile Selection Mode Buttons */}
                <div className="md:hidden w-full flex gap-2 mb-2">
                  <Button
                    onClick={() => setIsMobileSelecting(!isMobileSelecting)}
                    variant="outline"
                    size="sm"
                    className="flex-grow"
                  >
                    {isMobileSelecting ? "Done" : "Select Sites"}
                  </Button>
                  {isMobileSelecting && (
                    <>
                      <Button
                        onClick={() => setSelectedSites(sites)}
                        variant="outline"
                        size="sm"
                      >
                        Select All
                      </Button>
                      <Button
                        onClick={() => setSelectedSites([])}
                        variant="outline"
                        size="sm"
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
                    "md:block",
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
                      "transition-all duration-200",
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
          <div ref={resultsContainerRef} className="mt-6 space-y-8 scroll-mt-4">
            {searchQuery && searchResults.length > 0 ? (
              selectedSites.map((site) => {
                const siteResults = searchResults.filter((result) =>
                  result.link.includes(site)
                );

                return (
                  <div key={site} className="border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">
                      Results from {site}
                    </h3>

                    {siteResults.length === 0 ? (
                      <p className="text-gray-500 italic">
                        No results found for {site}
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {siteResults
                          .slice(0, loadedCounts[site] || RESULTS_PER_SITE)
                          .map((result, index) => (
                            <div
                              key={index}
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
                              <p className="text-sm text-gray-600 mt-2">
                                {result.snippet}
                              </p>
                            </div>
                          ))}
                        {siteResults.length >
                          (loadedCounts[site] || RESULTS_PER_SITE) && (
                          <Button
                            onClick={() => handleLoadMore(site)}
                            variant="outline"
                            size="sm"
                          >
                            Load More from {site}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : searchQuery && !loading ? (
              <div className="text-center text-gray-500">
                No results found for your search
              </div>
            ) : null}

            {loading && (
              <div className="text-center text-gray-500">Searching...</div>
            )}
          </div>

          {/* Replace pagination with Load More */}
          <LoadMoreButton />
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <CustomDialogContent>
          <DialogHeader>
            <CustomDialogTitle>Request New Site</CustomDialogTitle>
            <p className="text-sm text-gray-500">
              Enter the domain of the site you'd like to include in the search.
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
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSiteRequest}>Submit Request</Button>
          </DialogFooter>
        </CustomDialogContent>
      </Dialog>
    </>
  );
};

export default BetaSearch;
