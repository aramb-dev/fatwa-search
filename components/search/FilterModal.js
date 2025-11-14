import React from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";

export const FilterModal = ({
  isOpen,
  onClose,
  searchResults,
  siteFilters,
  setSiteFilters,
  translations,
}) => {
  const uniqueSites = Array.from(
    new Set(searchResults.map((result) => new URL(result.link).hostname)),
  );

  const handleToggleSite = (site, isChecked) => {
    if (isChecked) {
      setSiteFilters([...siteFilters, site]);
    } else {
      setSiteFilters(siteFilters.filter((s) => s !== site));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>{translations.filterResults}</DialogTitle>
          <p className="text-sm text-gray-500">{translations.filterBySite}</p>
          <p className="text-xs text-gray-400 italic">
            {translations.loadMoreTip}
          </p>
        </DialogHeader>
        <div className="space-y-4">
          {uniqueSites.map((site) => (
            <div key={site} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={site}
                checked={siteFilters.includes(site)}
                onChange={(e) => handleToggleSite(site, e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor={site}>{site}</label>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setSiteFilters([])}>
            {translations.clearFilters}
          </Button>
          <Button onClick={onClose}>{translations.close}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

FilterModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  searchResults: PropTypes.array.isRequired,
  siteFilters: PropTypes.array.isRequired,
  setSiteFilters: PropTypes.func.isRequired,
  translations: PropTypes.object.isRequired,
};
