import React from "react";
import { motion } from "framer-motion";
import type { SearchResultItem } from "../../lib/types";

interface SearchResultProps {
  result: SearchResultItem;
  isNewResult?: boolean;
}

export const SearchResult = React.memo(({ result, isNewResult }: SearchResultProps) => {
  let hostname = "";
  let breadcrumb = "";

  try {
    const url = new URL(result.link);
    hostname = url.hostname.replace(/^www\./, "");
    const parts = url.pathname.split("/").filter(Boolean);
    breadcrumb = parts.length > 0 ? [hostname, ...parts].join(" › ") : hostname;
  } catch {
    hostname = result.link;
    breadcrumb = result.link;
  }

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;

  return (
    <motion.div
      initial={isNewResult ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: isNewResult ? 0.05 : 0 }}
      className="py-4 group"
    >
      <div className="flex items-center gap-2 mb-1">
        <img
          src={faviconUrl}
          alt=""
          className="w-4 h-4 rounded-full flex-shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <span className="text-sm text-gray-700 truncate">{breadcrumb}</span>
      </div>

      <a
        href={result.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#1a0dab] hover:underline text-xl font-normal leading-snug block mb-1 group-hover:text-[#1a0dab]"
      >
        {result.title}
      </a>

      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
        {result.snippet}
      </p>
    </motion.div>
  );
});

SearchResult.displayName = "SearchResult";
