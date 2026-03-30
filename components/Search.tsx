"use client";

import React from "react";
import { Search, Plus, Share2, X } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { translations } from "../translations";
import { FeedbackModal } from "./search/FeedbackModal";
import { SiteRequestModal } from "./search/SiteRequestModal";
import { FilterModal } from "./search/FilterModal";
import { SitePickerModal } from "./search/SitePickerModal";
import { SITE_LABELS_AR } from "../lib/constants";
import { cn } from "../lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useSearch } from "../hooks/useSearch";
import { SearchResult } from "./search/SearchResult";
import type { Language, SearchMode, SearchResultItem } from "../lib/types";

export { DEFAULT_SITES, ENGLISH_SITES } from "../lib/constants";

const resultsVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

interface SearchComponentProps {
  language?: Language;
}

const SearchComponent = ({ language = "en" }: SearchComponentProps) => {
  let t = translations[language];
  if (!t) {
    console.error("Missing translations for language:", language);
    t = translations.en;
  }

  const isEnglish = language === "en";

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    loading,
    hasMore,
    hasSearched,
    startIndex,
    selectedSites,
    setSelectedSites,
    siteFilters,
    setSiteFilters,
    searchMode,
    setSearchMode,
    sites,
    filteredResults,
    siteInput,
    setSiteInput,
    feedback,
    setFeedback,
    activeModal,
    openModal,
    closeModal,
    showV3Modal,
    setShowV3Modal,
    handleSearch,
    handleReset,
    handleShare,
    handleSiteRequest,
    handleFeedbackSubmit,
    performSearch,
  } = useSearch({ language, t });

  const hasResults = filteredResults.length > 0;
  const isLoading = loading && searchQuery;
  const showEmptyState = hasSearched && !loading && !hasResults;

  return (
    <>
      <Toaster position="top-center" />

      <div className={cn(
        "w-full max-w-3xl mx-auto px-4",
        !hasSearched
          ? "min-h-[calc(100vh-10rem)] flex flex-col justify-center pb-8"
          : "pb-24"
      )}>
        {!hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6"
          >
            <button
              type="button"
              onClick={() => setShowV3Modal(true)}
              className="inline-flex items-center gap-1.5 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-gray-700 transition-colors"
            >
              <span className="bg-white text-gray-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                {t.newBadge}
              </span>
              {t.v3Announcement}
              <span className="opacity-60">→</span>
            </button>
          </motion.div>
        )}

        {!hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center pb-6"
          >
            <h1 className="text-3xl font-semibold text-gray-900 mb-1">
              {t.searchLabel}
            </h1>
            <p className="text-gray-500 text-sm">{t.searchDescription}</p>
          </motion.div>
        )}

        <div className={cn(hasSearched && "sticky top-4 z-20 pt-4")}>
          <form onSubmit={handleSearch}>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full shadow-md px-3 py-2">
              {searchMode === "scholars" && (
                <button
                  type="button"
                  onClick={() => openModal("sitePicker")}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center flex-shrink-0 transition-colors"
                  aria-label="Select sites to search"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}

              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder || "Ask anything"}
                className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400 text-base min-w-0"
                aria-label={t.searchPlaceholder}
                type="search"
                autoFocus
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-label={t.share || "Share"}
                >
                  <Share2 className="w-4 h-4" />
                </button>
              )}

              {hasSearched && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="submit"
                disabled={loading || !searchQuery.trim()}
                className={cn(
                  "flex items-center justify-center flex-shrink-0 transition-all gap-1.5 font-medium text-sm",
                  searchQuery.trim()
                    ? "bg-gray-900 hover:bg-gray-700 text-white rounded-full px-4 h-8"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed rounded-full w-8 h-8",
                )}
                aria-label={t.searchAction}
              >
                <Search className="w-4 h-4 flex-shrink-0" />
                {searchQuery.trim() && (
                  <span>{loading ? t.searching : t.searchAction}</span>
                )}
              </button>
            </div>
          </form>

          {searchQuery && (
            <div className="flex items-center gap-1.5 mt-2 px-1 min-h-[24px]">
              {(() => {
                if (searchMode !== "scholars") {
                  const modeLabel: Record<string, string> = {
                    shamela: t.modeShamela || "Shamela",
                    dorar: t.modeDorar || "Dorar",
                    almaany: t.modeAlmaany || "Al-Maany",
                  };
                  return (
                    <span className="text-xs text-gray-400 py-1">{modeLabel[searchMode]}</span>
                  );
                }

                const sep = isEnglish ? ", " : "، ";
                if (selectedSites.length === 0) return null;

                const MAX_SHOWN = 2;
                const shown = selectedSites.slice(0, MAX_SHOWN).map((s) => SITE_LABELS_AR[s] || s);
                const remaining = selectedSites.length - MAX_SHOWN;
                const summary =
                  shown.join(sep) +
                  (remaining > 0
                    ? " " + (t.andNMore || "and {n} more").replace("{n}", String(remaining))
                    : "");

                return (
                  <span className="text-xs text-gray-400 py-1 truncate">{summary}</span>
                );
              })()}
              {searchResults.length > 0 && (
                <button
                  type="button"
                  onClick={() => openModal("filter")}
                  className="text-xs text-blue-600 hover:underline py-0.5 ml-1 flex-shrink-0"
                >
                  {t.filter}
                </button>
              )}
            </div>
          )}
        </div>

        {!isEnglish && (
          <div className="flex gap-1 mt-3 border-b border-gray-100 overflow-x-auto">
            {(
              [
                { id: "scholars" as SearchMode, label: t.modeScholars || "العلماء" },
                { id: "shamela" as SearchMode, label: t.modeShamela || "الشاملة" },
                { id: "dorar" as SearchMode, label: t.modeDorar || "الدرر" },
                { id: "almaany" as SearchMode, label: t.modeAlmaany || "المعاني" },
              ] as { id: SearchMode; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSearchMode(tab.id);
                  // reset results on mode switch — handled by parent via setSearchMode
                }}
                className={cn(
                  "px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px flex-shrink-0",
                  searchMode === tab.id
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-6">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="skeletons"
                variants={resultsVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                {[...new Array(5)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-4 h-4 rounded-full" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                ))}
              </motion.div>
            ) : hasResults ? (
              <motion.div
                key="results"
                variants={resultsVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="divide-y divide-gray-100"
              >
                {filteredResults.map((result, index) => (
                  <SearchResult
                    key={result.link}
                    result={result}
                    isNewResult={index >= filteredResults.length - 10}
                  />
                ))}
              </motion.div>
            ) : showEmptyState ? (
              <motion.div
                key="empty"
                variants={resultsVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-center py-16"
              >
                <svg
                  className="mx-auto h-10 w-10 text-gray-300 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-base font-medium text-gray-700 mb-1">
                  {t.noResults}
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  {t.tryDifferentKeywords}
                </p>
                <button
                  onClick={() => openModal("siteRequest")}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {t.requestNewSite}
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {hasMore && searchResults.length > 0 && !loading && (
          <div className="fixed bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
            <Button
              onClick={() => performSearch(startIndex)}
              disabled={loading}
              variant="outline"
              className="shadow-lg bg-white hover:bg-gray-50"
            >
              {t.loadMore}
            </Button>
            <Button
              variant="outline"
              onClick={() => openModal("feedback")}
              className="shadow-lg bg-white hover:bg-gray-50"
            >
              {t.provideFeedback}
            </Button>
          </div>
        )}

        {!hasSearched && (
          <div className="mt-8 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
            <span>{t.createdBy}</span>
            <a
              href="https://github.com/aramb-dev"
              className="hover:text-gray-600 underline"
              target="_blank"
              rel="noreferrer"
            >
              عبد من عباد الله
            </a>
            <span>·</span>
            <a
              href="https://github.com/aramb-dev/fatwa-search"
              className="hover:text-gray-600 underline"
              target="_blank"
              rel="noreferrer"
            >
              {t.viewOnGithub}
            </a>
            <span>·</span>
            <button
              onClick={() => openModal("feedback")}
              className="hover:text-gray-600 underline"
            >
              {t.provideFeedback}
            </button>
          </div>
        )}
      </div>

      <SitePickerModal
        isOpen={activeModal === "sitePicker"}
        onClose={closeModal}
        sites={sites}
        selectedSites={selectedSites}
        setSelectedSites={setSelectedSites}
        translations={t}
        onRequestSite={() => openModal("siteRequest")}
        isEnglish={isEnglish}
      />

      <FeedbackModal
        isOpen={activeModal === "feedback"}
        onClose={closeModal}
        feedback={feedback}
        setFeedback={setFeedback}
        onSubmit={handleFeedbackSubmit}
        translations={t}
      />
      <SiteRequestModal
        isOpen={activeModal === "siteRequest"}
        onClose={closeModal}
        siteInput={siteInput}
        setSiteInput={setSiteInput}
        onSubmit={handleSiteRequest}
        translations={t}
      />
      {searchResults.length > 0 && (
        <FilterModal
          isOpen={activeModal === "filter"}
          onClose={closeModal}
          searchResults={searchResults}
          siteFilters={siteFilters}
          setSiteFilters={setSiteFilters}
          translations={t}
        />
      )}

      <Dialog
        open={showV3Modal}
        onOpenChange={(open) => {
          setShowV3Modal(open);
          if (!open) localStorage.setItem("v3-announced", "1");
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full leading-none tracking-wide">
                {t.newBadge}
              </span>
              <DialogTitle className="text-base">{t.v3WhatsNew}</DialogTitle>
            </div>
          </DialogHeader>

          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="mt-0.5 text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </span>
              <span><strong className="text-gray-900">{t.v3Feature1Title}</strong> — {t.v3Feature1Desc}</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>
                </svg>
              </span>
              <span><strong className="text-gray-900">{t.v3Feature2Title}</strong> — {t.v3Feature2Desc}</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
              </span>
              <span><strong className="text-gray-900">{t.v3Feature3Title}</strong> — {t.v3Feature3Desc}</span>
            </li>
          </ul>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setShowV3Modal(false);
                localStorage.setItem("v3-announced", "1");
              }}
              className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-full hover:bg-gray-700 transition-colors"
            >
              {t.gotIt}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SearchComponent;
