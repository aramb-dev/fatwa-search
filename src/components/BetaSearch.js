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
  const [selectedSite, setSelectedSite] = useState("all");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const siteQuery =
        selectedSite === "all"
          ? sites.map((site) => `site:${site}`).join(" OR ")
          : `site:${selectedSite}`;

      const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${
        process.env.REACT_APP_GOOGLE_API_KEY
      }&cx=${process.env.REACT_APP_SEARCH_ENGINE_ID}&q=${encodeURIComponent(
        `(${siteQuery}) ${searchQuery}`
      )}`;

      const response = await fetch(searchUrl);
      const data = await response.json();
      setSearchResults(data.items || []);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

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
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="rounded-md border px-3"
            >
              <option value="all">All Sites</option>
              {sites.map((site) => (
                <option key={site} value={site}>
                  {site}
                </option>
              ))}
            </select>
            <Button type="submit" disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </form>

        {/* Search Results */}
        <div className="mt-6">
          {searchResults.map((result, index) => (
            <div key={index} className="mb-4 p-4 border rounded-lg">
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
      </CardContent>
    </Card>
  );
};

export default BetaSearch;
