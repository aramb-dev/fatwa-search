"use client";

import React from "react";
import { Play as Youtube, Filter, Share2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Toaster } from "sonner";
import { AnimatePresence } from "framer-motion";
import { VideoGrid } from "./youtube/VideoGrid";
import { VideoModal } from "./youtube/VideoModal";
import { ChannelRequestModal } from "./youtube/ChannelRequestModal";
import { ChannelFilterModal } from "./youtube/ChannelFilterModal";
import { useYoutubeSearch } from "../hooks/useYoutubeSearch";
import { translations as allTranslations } from "../translations";
import type { Language } from "../lib/types";

interface YoutubeSearchProps {
  language?: Language;
}

const YoutubeSearch = ({ language = "ar" }: YoutubeSearchProps) => {
  const t = allTranslations[language] ?? allTranslations.ar;

  const {
    searchQuery,
    setSearchQuery,
    filteredResults,
    results,
    loading,
    hasMore,
    selectedVideo,
    setSelectedVideo,
    channelRequest,
    setChannelRequest,
    channelFilters,
    setChannelFilters,
    activeModal,
    setActiveModal,
    handleSearch,
    handleShare,
    handleChannelRequest,
    performYoutubeSearch,
    debouncedSearch,
  } = useYoutubeSearch({ language, t });

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Toaster position="top-center" />
      <div className="space-y-4">
        {language === "en" && t.ytEnglishComingSoon && (
          <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{t.ytEnglishComingSoon}</p>
          </div>
        )}

        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              debouncedSearch();
            }}
            placeholder={t.searchPlaceholder}
            className="flex-grow"
          />
          <Button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Youtube className="h-4 w-4" />
            {loading ? t.searching : t.searchAction}
          </Button>

          {searchQuery && (
            <Button
              variant="outline"
              onClick={handleShare}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              {t.share}
            </Button>
          )}

          <Button
            variant="outline"
            type="button"
            onClick={() => setActiveModal("channel")}
            className="flex items-center gap-2"
          >
            {t.requestChannel}
          </Button>

          {results.length > 0 && (
            <Button
              variant="outline"
              type="button"
              onClick={() => setActiveModal("filter")}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {t.filter}
            </Button>
          )}
        </form>

        <VideoGrid videos={filteredResults} onVideoClick={setSelectedVideo} />

        <AnimatePresence>
          {selectedVideo && (
            <VideoModal
              video={selectedVideo}
              onClose={() => setSelectedVideo(null)}
              translations={t}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {activeModal === "channel" && (
            <ChannelRequestModal
              isOpen={true}
              onClose={() => setActiveModal(null)}
              channelRequest={channelRequest}
              setChannelRequest={setChannelRequest}
              onSubmit={handleChannelRequest}
              translations={t}
            />
          )}
        </AnimatePresence>

        {results.length > 0 && hasMore && !loading && (
          <div className="fixed bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
            <Button
              onClick={() => performYoutubeSearch()}
              disabled={loading}
              variant="outline"
              className="w-full max-w-sm shadow-lg bg-white hover:bg-gray-50"
            >
              {loading ? t.loading : t.loadMore}
            </Button>
          </div>
        )}

        <AnimatePresence>
          {activeModal === "filter" && (
            <ChannelFilterModal
              isOpen={true}
              onClose={() => setActiveModal(null)}
              results={results}
              channelFilters={channelFilters}
              setChannelFilters={setChannelFilters}
              translations={t}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default YoutubeSearch;
