import React, { useState, useEffect } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { Youtube, Search as SearchIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import {
  useNavigate,
  useLocation,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Search from "./components/Search";
import YoutubeSearch from "./components/Youtube-Search";
import { translations } from './translations';

const cn = (...args) => clsx(...args);

// Animation variants remain the same
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

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize language based on URL path or stored preference
  const initLanguage = () => {
    // Check URL first
    if (location.pathname.startsWith('/en/')) return 'en';
    if (location.pathname.startsWith('/ar/')) return 'ar';

    // Then check localStorage
    const stored = localStorage.getItem('language');
    if (stored) return stored;

    // Default to Arabic
    return 'ar';
  };

  const [language, setLanguage] = useState(initLanguage);
  const [activeTab, setActiveTab] = useState(
    location.pathname.includes("/yt-search") ? "youtube" : "search"
  );

  // Handle language changes
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('language', newLang);

    // Update URL to include language prefix
    const currentPath = location.pathname
      .replace(/^\/[a-z]{2}\//, '/') // Remove any existing language prefix
      .replace(/^\//, ''); // Remove leading slash

    const newPath = `/${newLang}/${currentPath || 'search'}`;
    navigate(newPath);
  };

  // Redirect to language-prefixed route on initial load
  useEffect(() => {
    // Only redirect if we're at root or missing language prefix
    if (!location.pathname.match(/^\/[a-z]{2}\//)) {
      const currentPath = location.pathname.replace(/^\//, '');
      const newPath = `/${language}/${currentPath || 'search'}`;
      navigate(newPath, { replace: true });
    }
  }, []);

  // Handle tab changes with language prefix
  const handleTabChange = (value) => {
    setActiveTab(value);
    const newPath = `/${language}/${value === "youtube" ? "yt-search" : "search"}`;
    navigate(newPath);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4">
      {/* Add language toggle above tabs */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex items-center rounded-lg border bg-white p-0.5 shadow-sm"> {/* Reduced padding from p-1 to p-0.5 */}
          <button
            onClick={() => handleLanguageChange('en')}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md px-2 py-1 text-sm font-medium", // Reduced from px-3 py-1.5
              "ring-offset-white transition-all focus-visible:outline-none",
              "focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:opacity-50",
              language === 'en' ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-500"
            )}
          >
            EN
          </button>
          <button
            onClick={() => handleLanguageChange('ar')}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md px-2 py-1 text-sm font-medium", // Reduced from px-3 py-1.5
              "ring-offset-white transition-all focus-visible:outline-none",
              "focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:opacity-50",
              language === 'ar' ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-500"
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
          <Routes>
            <Route path="/" element={<Navigate to="/ar/search" replace />} />
            <Route path="/en" element={<Navigate to="/en/search" replace />} />
            <Route path="/ar" element={<Navigate to="/ar/search" replace />} />

            {/* English routes */}
            <Route
              path="/en/search"
              element={
                <motion.div key="search" variants={tabContentVariants}>
                  <Tabs.Content value="search">
                    <Search language="en" translations={translations.en} />
                  </Tabs.Content>
                </motion.div>
              }
            />
            <Route
              path="/en/yt-search"
              element={
                <motion.div key="youtube" variants={tabContentVariants}>
                  <Tabs.Content value="youtube">
                    <YoutubeSearch language="en" translations={translations.en} />
                  </Tabs.Content>
                </motion.div>
              }
            />

            {/* Arabic routes */}
            <Route
              path="/ar/search"
              element={
                <motion.div key="search" variants={tabContentVariants}>
                  <Tabs.Content value="search">
                    <Search language="ar" translations={translations.ar} />
                  </Tabs.Content>
                </motion.div>
              }
            />
            <Route
              path="/ar/yt-search"
              element={
                <motion.div key="youtube" variants={tabContentVariants}>
                  <Tabs.Content value="youtube">
                    <YoutubeSearch language="ar" translations={translations.ar} />
                  </Tabs.Content>
                </motion.div>
              }
            />
          </Routes>
        </AnimatePresence>
      </Tabs.Root>
    </div>
  );
}

export default App;
