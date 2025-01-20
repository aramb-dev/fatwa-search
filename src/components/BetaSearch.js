import React, { useState, useEffect, useCallback } from "react"; // Add useCallback import
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
import { Dialog, DialogOverlay } from "@radix-ui/react-dialog";

// Update DialogContent styling
const CustomDialogContent = ({ children, ...props }) => (
  <DialogOverlay className="bg-black/50 fixed inset-0 flex items-center justify-center">
    <div
      className={cn(
        "fixed left-[50%] top-[50%] w-[670px] translate-x-[-50%] translate-y-[-50%]",
        "bg-white rounded-lg shadow-[0_0_40px_8px_rgba(0,0,0,0.15)]",
        "p-6 space-y-6"
      )}
      {...props}
    >
      {children}
    </div>
  </DialogOverlay>
);

// Update DialogHeader styling
const DialogHeader = ({ children }) => (
  <div className="flex flex-col space-y-3 mb-6">{children}</div>
);

// Update DialogTitle styling
const CustomDialogTitle = ({ children }) => (
  <h2 className="text-xl font-semibold leading-none tracking-tight">
    {children}
  </h2>
);

// Update DialogFooter styling
const DialogFooter = ({ children }) => (
  <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-4 mt-6 pt-6 border-t">
    {children}
  </div>
);

const BetaSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sites] = useState(DEFAULT_SITES); // Remove unused setSites
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [totalResults, setTotalResults] = useState(0);
  const MAX_RESULTS = 100; // Google CSE limit
  const resultsPerPage = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [siteInput, setSiteInput] = useState("");

  const performSearch = useCallback(
    async (page) => {
      // Validate page number
      if (page > 10) {
        alert("Google Custom Search only allows up to 100 results (10 pages)");
        setCurrentPage(10);
        return;
      }

      setLoading(true);
      try {
        const siteQuery =
          selectedFilter === "all"
            ? sites.map((site) => `site:${site}`).join(" OR ")
            : `site:${selectedFilter}`;

        const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${
          process.env.REACT_APP_GOOGLE_API_KEY
        }&cx=${process.env.REACT_APP_SEARCH_ENGINE_ID}&q=${encodeURIComponent(
          `(${siteQuery}) ${searchQuery}`
        )}&start=${(page - 1) * resultsPerPage + 1}`;

        const response = await fetch(searchUrl);
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error.message);
        }

        setSearchResults(data.items || []);
        // Cap total results at 100
        setTotalResults(
          Math.min(
            parseInt(data.searchInformation.totalResults) || 0,
            MAX_RESULTS
          )
        );
      } catch (error) {
        console.error("Search failed:", error);
        alert("Search failed: " + error.message);
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, selectedFilter, sites]
  ); // Add dependencies used inside performSearch

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setCurrentPage(1);
    setSelectedFilter("all"); // Reset filter when performing new search
    await performSearch(1);
  };

  const handleSiteRequest = async () => {
    if (!siteInput.trim()) return;

    const formData = new FormData();
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

  useEffect(() => {
    if (searchQuery && currentPage) {
      performSearch(currentPage);
    }
  }, [currentPage, searchQuery, selectedFilter, sites, performSearch]); // Add performSearch to dependencies

  const filteredResults = searchResults.filter((result) => {
    if (selectedFilter === "all") return true;
    return result.displayLink.includes(selectedFilter);
  });

  const totalPages = Math.min(Math.ceil(totalResults / resultsPerPage), 10);
  const currentResults = filteredResults.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

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
          </form>

          {/* Site Filters */}
          <div className="flex gap-2 mt-4 flex-wrap">
            <Button
              onClick={() => setSelectedFilter("all")}
              variant={selectedFilter === "all" ? "default" : "outline"}
              size="sm"
            >
              All Sites
            </Button>
            {sites.map((site) => (
              <Button
                key={site}
                onClick={() => setSelectedFilter(site)}
                variant={selectedFilter === site ? "default" : "outline"}
                size="sm"
              >
                {site}
              </Button>
            ))}
          </div>

          {/* Search Results */}
          <div className="mt-6 space-y-4">
            {currentResults.map((result, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <a
                  href={result.link}
                  className="text-blue-600 hover:underline font-medium"
                  target="_blank"
                  rel="noreferrer"
                >
                  {result.title}
                </a>
                <p className="text-sm text-gray-600 mt-1">{result.snippet}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {result.displayLink}
                </p>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6 mb-4">
              <Button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <span className="flex items-center px-3">
                Page {currentPage} of {totalPages} (Max 10)
              </span>
              <Button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages || loading}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          )}
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
