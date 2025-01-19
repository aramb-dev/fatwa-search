import React, { useState } from "react";
import { Search, Plus, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

const CustomSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sites, setSites] = useState([
    "binothaimeen.net",
    "alfawzan.af.org.sa",
    "lohaidan.af.org.sa",
    "binbaz.org.sa",
    "al-badr.net",
    "obied-aljabri.com",
  ]);
  const [newSite, setNewSite] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Construct the Google search URL with site: operators
    const siteQuery = sites.map((site) => `site:${site}`).join(" OR ");
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
      `(${siteQuery}) ${searchQuery}`
    )}`;

    // Open the search in a new tab
    window.open(searchUrl, "_blank", "noopener,noreferrer");
  };

  const addSite = (e) => {
    e.preventDefault();
    if (!newSite.trim()) return;

    // Basic URL validation
    let site = newSite.trim().toLowerCase();
    if (!site.match(/^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/)) {
      alert("Please enter a valid domain (e.g., example.com)");
      return;
    }

    if (!sites.includes(site)) {
      setSites([...sites, site]);
    }
    setNewSite("");
  };

  const removeSite = (siteToRemove) => {
    setSites(sites.filter((site) => site !== siteToRemove));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Custom Site Search</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter your search query..."
              className="flex-grow"
            />
            <Button
              type="submit"
              variant="default"
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>
        </form>

        {/* Add Site Form */}
        <form onSubmit={addSite} className="mt-6">
          <div className="flex gap-2">
            <Input
              type="text"
              value={newSite}
              onChange={(e) => setNewSite(e.target.value)}
              placeholder="Add a site (e.g., example.com)"
              className="flex-grow"
            />
            <Button
              type="submit"
              variant="default"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Site
            </Button>
          </div>
        </form>

        {/* Site List */}
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Sites to search:</h3>
          <div className="flex flex-wrap gap-2">
            {sites.map((site) => (
              <div
                key={site}
                className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1"
              >
                <span className="text-sm">{site}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => removeSite(site)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomSearch;
