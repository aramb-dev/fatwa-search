import React from "react";
import PropTypes from "prop-types";
import { Button } from "../ui/button";
import { cn, isMobile } from "../../lib/utils";

export const SiteFilters = ({
  sites,
  selectedSites,
  setSelectedSites,
  isShiftPressed,
  isMobileSelecting,
  setIsMobileSelecting,
  translations,
}) => {
  const toggleSite = (site) => {
    if (isShiftPressed) {
      setSelectedSites((prev) =>
        prev.includes(site) ? prev.filter((s) => s !== site) : [...prev, site],
      );
    } else {
      setSelectedSites([site]);
    }
  };

  const handleSiteClick = (site) => {
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
      toggleSite(site);
    }
  };

  const handleSiteKeyDown = (e, site) => {
    // Handle Space or Enter key for keyboard navigation
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleSiteClick(site);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500 italic md:block hidden">
        {translations.selectTooltip}
        <span className="block text-xs mt-1">
          Keyboard: Use Tab to navigate, Space/Enter to select, Shift+Click for
          multi-select
        </span>
      </p>
      <p className="text-sm text-gray-500 italic block md:hidden">
        Tap &ldquo;Select Sites&rdquo; to choose multiple sites, or tap
        individual sites to search one at a time
      </p>

      <div className="flex flex-wrap gap-2 relative w-full">
        {/* Mobile controls */}
        <div className="md:hidden w-full flex flex-wrap gap-2 mb-2">
          <Button
            onClick={() => setIsMobileSelecting(!isMobileSelecting)}
            variant="outline"
            size="sm"
            className="flex-shrink-0"
            aria-label={
              isMobileSelecting
                ? "Done selecting sites"
                : "Select multiple sites"
            }
            aria-pressed={isMobileSelecting}
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
                aria-label={`Select all ${sites.length} sites`}
              >
                Select All
              </Button>
              <Button
                onClick={() => setSelectedSites([])}
                variant="outline"
                size="sm"
                className="flex-shrink-0"
                aria-label="Deselect all sites"
              >
                Select None
              </Button>
            </>
          )}
        </div>

        {/* All Sites button */}
        <Button
          onClick={() => setSelectedSites(sites)}
          variant={
            selectedSites.length === sites.length ? "default" : "outline"
          }
          size="sm"
          type="button"
          className={cn(
            "md:block flex-shrink-0",
            isMobileSelecting ? "hidden" : "block",
          )}
          aria-label={`Search all ${sites.length} sites`}
          aria-pressed={selectedSites.length === sites.length}
        >
          All Sites
        </Button>

        {/* Individual site buttons */}
        {sites.map((site) => (
          <Button
            key={site}
            onClick={() => handleSiteClick(site)}
            onKeyDown={(e) => handleSiteKeyDown(e, site)}
            className={cn(
              "transition-all duration-200 flex-shrink-0",
              selectedSites.includes(site)
                ? "bg-green-600 hover:bg-green-700 text-white border-2 border-green-600"
                : "bg-white text-gray-700 hover:bg-gray-100",
              !isMobileSelecting && "md:block",
            )}
            size="sm"
            type="button"
            // Using role="checkbox" pattern for better semantics (WCAG compliant)
            // eslint-disable-next-line jsx-a11y/role-supports-aria-props
            role="checkbox"
            aria-checked={selectedSites.includes(site)}
            aria-label={`${selectedSites.includes(site) ? "Deselect" : "Select"} ${site} (${isShiftPressed ? "Shift+Click to multi-select" : "Click to select only this site"})`}
          >
            {site}
          </Button>
        ))}
      </div>
    </div>
  );
};

SiteFilters.propTypes = {
  sites: PropTypes.array.isRequired,
  selectedSites: PropTypes.array.isRequired,
  setSelectedSites: PropTypes.func.isRequired,
  isShiftPressed: PropTypes.bool.isRequired,
  isMobileSelecting: PropTypes.bool.isRequired,
  setIsMobileSelecting: PropTypes.func.isRequired,
  translations: PropTypes.object.isRequired,
};
