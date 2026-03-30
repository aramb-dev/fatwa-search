"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import * as Tabs from "@radix-ui/react-tabs";
import { Play as Youtube, Search as SearchIcon } from "lucide-react";
import { clsx } from "clsx";
import { translations } from "../../translations";
import ErrorBoundary from "../../components/ErrorBoundary";
import type { Language } from "../../lib/types";
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from "../../lib/constants";

const cn = (...args: Parameters<typeof clsx>) => clsx(...args);

function toLanguage(lang: string): Language {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(lang)
    ? (lang as Language)
    : DEFAULT_LANGUAGE;
}

export default function LanguageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { lang: rawLang } = React.use(params);
  const lang = toLanguage(rawLang);
  const [language, setLanguage] = useState<Language>(lang);
  const activeTab = pathname.includes("/yt-search") ? "youtube" : "search";

  const handleLanguageChange = (newLang: Language): void => {
    setLanguage(newLang);
    localStorage.setItem("language", newLang);
    const currentPath = pathname
      .replace(/^\/[a-z]{2}\//, "/")
      .replace(/^\//, "");
    const newPath = `/${newLang}/${currentPath || "search"}`;
    router.push(newPath);
  };

  const handleTabChange = (value: string) => {
    const newPath = `/${language}/${value === "youtube" ? "yt-search" : "search"}`;
    router.push(newPath);
  };

  useEffect(() => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  }, [lang]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4">
      <div className="flex justify-center mb-4">
        <div className="inline-flex items-center rounded-full border bg-white p-0.5 shadow-sm gap-0.5">
          <button
            onClick={() => handleLanguageChange("en")}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium",
              "ring-offset-white transition-all focus-visible:outline-none",
              "focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:opacity-50",
              language === "en" ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-500",
            )}
          >
            EN
          </button>
          <button
            onClick={() => handleLanguageChange("ar")}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium",
              "ring-offset-white transition-all focus-visible:outline-none",
              "focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:opacity-50",
              language === "ar" ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-500",
            )}
          >
            ع
          </button>
        </div>
      </div>

      <Tabs.Root value={activeTab} onValueChange={handleTabChange}>
        <div className="flex justify-center mb-4">
          <Tabs.List className="inline-flex items-center rounded-full border bg-white p-1 shadow-sm gap-1">
            <Tabs.Trigger
              value="search"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium text-gray-500 transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <SearchIcon className="h-4 w-4" />
              {translations[language].search}
            </Tabs.Trigger>
            <Tabs.Trigger
              value="youtube"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium text-gray-500 transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <Youtube className="h-4 w-4" />
              {translations[language].youtubeSearch}
            </Tabs.Trigger>
          </Tabs.List>
        </div>

        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </Tabs.Root>
    </div>
  );
}
