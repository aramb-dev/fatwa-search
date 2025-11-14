"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import PropTypes from "prop-types";
import * as Tabs from "@radix-ui/react-tabs";
import { Youtube, Search as SearchIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { translations } from "../../translations";
import V2Banner from "../../components/V2Banner";

const cn = (...args) => clsx(...args);

// Animation variants
const tabContentVariants = {
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

export default function LanguageLayoutClient({ children, lang }) {
  const router = useRouter();
  const pathname = usePathname();
  const [language, setLanguage] = useState(lang);
  const [activeTab, setActiveTab] = useState(
    pathname.includes("/yt-search") ? "youtube" : "search",
  );

  // Handle language changes
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem("language", newLang);

    // Update URL to include language prefix
    const currentPath = pathname
      .replace(/^\/[a-z]{2}\//, "/") // Remove any existing language prefix
      .replace(/^\//, ""); // Remove leading slash

    const newPath = `/${newLang}/${currentPath || "search"}`;
    router.push(newPath);
  };

  // Handle tab changes with language prefix
  const handleTabChange = (value) => {
    setActiveTab(value);
    const newPath = `/${language}/${value === "youtube" ? "yt-search" : "search"}`;
    router.push(newPath);
  };

  // Update active tab based on pathname
  useEffect(() => {
    setActiveTab(pathname.includes("/yt-search") ? "youtube" : "search");
  }, [pathname]);

  // Update language from params
  useEffect(() => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  }, [lang]);

  // Set document direction based on language
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4">
      {/* V2 Migration Banner */}
      <V2Banner language={language} translations={translations[language]} />

      {/* Language toggle above tabs */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex items-center rounded-lg border bg-white p-0.5 shadow-sm">
          <button
            onClick={() => handleLanguageChange("en")}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md px-2 py-1 text-sm font-medium",
              "ring-offset-white transition-all focus-visible:outline-none",
              "focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:opacity-50",
              language === "en"
                ? "bg-gray-100 text-gray-900 shadow-sm"
                : "text-gray-500",
            )}
          >
            EN
          </button>
          <button
            onClick={() => handleLanguageChange("ar")}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md px-2 py-1 text-sm font-medium",
              "ring-offset-white transition-all focus-visible:outline-none",
              "focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:opacity-50",
              language === "ar"
                ? "bg-gray-100 text-gray-900 shadow-sm"
                : "text-gray-500",
            )}
          >
            ع
          </button>
        </div>
      </div>

      <Tabs.Root value={activeTab} onValueChange={handleTabChange}>
        <div className="flex justify-center mb-4">
          <Tabs.List className="inline-flex items-center rounded-lg border bg-white p-1 shadow-sm">
            <Tabs.Trigger
              value="search"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-6 py-2.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
            >
              <SearchIcon className="h-4 w-4" />
              {translations[language].search}
            </Tabs.Trigger>
            <Tabs.Trigger
              value="youtube"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-6 py-2.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
            >
              <Youtube className="h-4 w-4" />
              {translations[language].youtubeSearch}
            </Tabs.Trigger>
          </Tabs.List>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${language}-${activeTab}`}
            variants={tabContentVariants}
            initial="exit"
            animate="enter"
            exit="exit"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Tabs.Root>
    </div>
  );
}

LanguageLayoutClient.propTypes = {
  children: PropTypes.node.isRequired,
  lang: PropTypes.string.isRequired,
};
