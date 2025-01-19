import React, { useState } from "react";
import { cn } from "../lib/utils";
import { Search, Plus, X, RotateCcw } from "lucide-react";
import { DEFAULT_SITES } from "./CustomSearch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

const BetaSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sites, setSites] = useState(DEFAULT_SITES);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const resultsPerPage = 10;

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setCurrentPage(1);

    try {
      const siteQuery = sites.map((site) => `site:${site}`).join(" OR ");
      const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${
        process.env.REACT_APP_GOOGLE_API_KEY
      }&cx=${process.env.REACT_APP_SEARCH_ENGINE_ID}&q=${encodeURIComponent(
        `(${siteQuery}) ${searchQuery}`
      )}&start=${(currentPage - 1) * resultsPerPage + 1}`;

      const response = await fetch(searchUrl);
      const data = await response.json();
      setSearchResults(data.items || []);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = searchResults.filter((result) => {
    if (selectedFilter === "all") return true;
    return result.displayLink.includes(selectedFilter);
  });

  const totalPages = Math.ceil(filteredResults.length / resultsPerPage);
  const currentResults = filteredResults.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle>Fatwa Search Beta</CardTitle>
        <p className="text-sm text-gray-500">
          Enhanced search with filtering capabilities
        </p>
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
                searchQuery.trim() && "bg-gray-900 text-white hover:bg-gray-800"
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
              <p className="text-xs text-gray-400 mt-1">{result.displayLink}</p>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <span className="flex items-center px-3">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BetaSearch;
