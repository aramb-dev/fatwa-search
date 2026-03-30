import React, { useState } from "react";
import PropTypes from "prop-types";
import { SITE_LABELS_EN, SITE_LABELS_AR } from "../../lib/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Check, BookOpen, Plus } from "lucide-react";
import { cn } from "../../lib/utils";

export { SITE_LABELS_EN, SITE_LABELS_AR };

const MenuItem = ({ icon: Icon, label, sublabel, checked, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 active:bg-gray-100 text-left transition-colors"
  >
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 text-gray-600">
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">{label}</p>
      {sublabel && <p className="text-xs text-gray-400 truncate">{sublabel}</p>}
    </div>
    <div
      className={cn(
        "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
        checked ? "bg-gray-900 border-gray-900" : "border-gray-300",
      )}
    >
      {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
    </div>
  </button>
);

MenuItem.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  sublabel: PropTypes.string,
  checked: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export const SitePickerModal = ({
  isOpen,
  onClose,
  sites,
  selectedSites,
  setSelectedSites,
  translations,
  onRequestSite,
  isEnglish,
}) => {
  const [activeTab, setActiveTab] = useState("all");
  const SITE_LABELS = isEnglish ? SITE_LABELS_EN : SITE_LABELS_AR;

  const tabs = isEnglish
    ? [{ id: "all", label: translations.tabAll || "All" }]
    : [
        { id: "all", label: translations.tabAll || "All" },
        { id: "scholars", label: translations.tabScholars || "Scholars" },
      ];

  const handleSelectAll = () => setSelectedSites(sites);
  const handleSelectNone = () => setSelectedSites([]);

  const toggleSite = (site) => {
    setSelectedSites((prev) =>
      prev.includes(site) ? prev.filter((s) => s !== site) : [...prev, site],
    );
  };

  const totalSelected = selectedSites.length;
  const showScholars = activeTab === "all" || activeTab === "scholars";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-sm p-0 gap-0"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader className="px-4 pt-4 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base">
              {translations.allSites || "Sites"}
            </DialogTitle>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-medium px-2 py-1 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
              >
                {translations.selectAll || "All"}
              </button>
              <button
                type="button"
                onClick={handleSelectNone}
                className="text-xs font-medium px-2 py-1 rounded-md text-gray-500 hover:bg-gray-50 transition-colors"
              >
                {translations.selectNone || "None"}
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 mb-3">
            {(translations.xOfYSelected || "{x} of {y} selected")
              .replace("{x}", totalSelected)
              .replace("{y}", sites.length)}
          </p>

          {/* Google-style tab strip */}
          {tabs.length > 1 && (
            <div className="flex gap-1 border-b border-gray-100 -mx-4 px-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px",
                    activeTab === tab.id
                      ? "border-gray-900 text-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-700",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </DialogHeader>

        {/* Scrollable list */}
        <div className="overflow-y-auto max-h-[52vh] px-2 py-2">
          {showScholars &&
            sites.map((site) => (
              <MenuItem
                key={site}
                icon={BookOpen}
                label={SITE_LABELS[site] || site}
                sublabel={SITE_LABELS[site] ? site : undefined}
                checked={selectedSites.includes(site)}
                onClick={() => toggleSite(site)}
              />
            ))}

          <div className="h-px bg-gray-100 mx-1 my-1" />

          <button
            type="button"
            onClick={() => {
              onClose();
              onRequestSite();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex-shrink-0 text-gray-400">
              <Plus className="w-4 h-4" />
            </div>
            <p className="text-sm text-gray-500">
              {translations.requestSite || "Request a site"}
            </p>
          </button>
        </div>

        <DialogFooter className="px-4 py-3 border-t bg-gray-50/50">
          <Button onClick={onClose} className="w-full sm:w-auto">
            {translations.done || "Done"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

SitePickerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  sites: PropTypes.array.isRequired,
  selectedSites: PropTypes.array.isRequired,
  setSelectedSites: PropTypes.func.isRequired,
  translations: PropTypes.object.isRequired,
  onRequestSite: PropTypes.func.isRequired,
  isEnglish: PropTypes.bool,
};
