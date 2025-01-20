import React, { useState } from "react";
import { cn } from "../lib/utils";
import { Search, Plus, X, RotateCcw } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

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
];

const isValidDomain = (domain) => {
  return domain.trim().match(/^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/);
};

const CustomSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sites, setSites] = useState(DEFAULT_SITES);
  const [newSite, setNewSite] = useState("");
  const [isDefaultSites, setIsDefaultSites] = useState(true);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const siteQuery = sites.map((site) => `site:${site}`).join(" OR ");
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
      `(${siteQuery}) ${searchQuery}`
    )}`;

    window.open(searchUrl, "_blank", "noopener,noreferrer");
  };

  const handleSiteRequest = (e) => {
    e.preventDefault();
    if (!newSite.trim()) return;

    // Basic URL validation
    let site = newSite.trim().toLowerCase();
    if (!site.match(/^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/)) {
      alert("Please enter a valid domain (e.g., example.com)");
      return;
    }

    // Submit form to Netlify
    const formData = new FormData();
    formData.append("form-name", "site-request");
    formData.append("requested-site", site);

    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData).toString(),
    })
      .then(() => {
        alert("Site request submitted successfully!");
        setNewSite("");
      })
      .catch((error) => alert("Error submitting request: " + error));
  };

  const removeSite = (siteToRemove) => {
    const newSites = sites.filter((site) => site !== siteToRemove);
    setSites(newSites);
    setIsDefaultSites(false);
  };

  const restoreDefaultSites = () => {
    setSites(DEFAULT_SITES);
    setIsDefaultSites(true);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Fatwa Search</CardTitle>
        <p className="text-sm text-gray-500">
          Searches the Mashayikh sites for your keyword
        </p>
        <p className="text-sm text-gray-500">
          Putting your keywords in Arabic is more effective as these are Arabic
          sites
        </p>
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
              className={cn(
                "flex items-center gap-2", // Preserve flex layout
                searchQuery.trim()
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              type="text"
              value={newSite}
              onChange={(e) => setNewSite(e.target.value)}
              placeholder="Request a site (e.g., example.com)"
              className="flex-grow"
            />
            <Button
              type="button"
              onClick={handleSiteRequest}
              className={cn(
                "flex items-center gap-2", // Preserve flex layout
                isValidDomain(newSite)
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              <Plus className="h-4 w-4" />
              Request Site
            </Button>
          </div>
        </form>
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Sites to search:</h3>
            {!isDefaultSites && (
              <Button
                onClick={restoreDefaultSites}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Restore Default Sites
              </Button>
            )}
          </div>
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
        <div className="mt-4 text-center text-sm text-gray-500">
          Created by{" "}
          <a
            href="https://github.com/aramb-dev"
            className="underline hover:text-gray-700"
            target="_blank"
            rel="noreferrer"
          >
            Abdur-Rahman Bilal
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
  );
};

export default CustomSearch;
