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
    if (!isShiftPressed) {
      setSelectedSites([site]);
    } else {
      setSelectedSites((prev) =>
        prev.includes(site) ? prev.filter((s) => s !== site) : [...prev, site]
      );
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500 italic md:block hidden">
        {translations.selectTooltip}
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
            isMobileSelecting ? "hidden" : "block"
          )}
        >
          All Sites
        </Button>

        {/* Individual site buttons */}
        {sites.map((site) => (
          <Button
            key={site}
            onClick={() => {
              if (isMobile()) {
                if (isMobileSelecting) {
                  setSelectedSites((prev) =>
                    prev.includes(site)
                      ? prev.filter((s) => s !== site)
                      : [...prev, site]
                  );
                } else {
                  setSelectedSites([site]);
                }
              } else {
                toggleSite(site);
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
