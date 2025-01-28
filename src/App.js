import React, { useState, useEffect } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { Youtube, Search as SearchIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useNavigate,
  useLocation,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Search from "./components/Search";
import YoutubeSearch from "./components/Youtube-Search";

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
  const [activeTab, setActiveTab] = useState(
    location.pathname === "/yt-search" ? "youtube" : "search"
  );

  // Update tab when route changes
  useEffect(() => {
    if (location.pathname === "/yt-search") {
      setActiveTab("youtube");
    } else if (location.pathname === "/search") {
      setActiveTab("search");
    }
  }, [location]);

  // Handle tab changes
  const handleTabChange = (value) => {
    setActiveTab(value);
    navigate(value === "youtube" ? "/yt-search" : "/search");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4">
      <Tabs.Root value={activeTab} onValueChange={handleTabChange}>
        <div className="flex justify-center mb-4">
          <Tabs.List className="inline-flex items-center rounded-lg border bg-white p-1 shadow-sm">
            <Tabs.Trigger
              value="search"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-6 py-2.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
            >
              <SearchIcon className="h-4 w-4" />
              Search
            </Tabs.Trigger>
            <Tabs.Trigger
              value="youtube"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-6 py-2.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
            >
              <Youtube className="h-4 w-4" />
              YouTube Search
            </Tabs.Trigger>
          </Tabs.List>
        </div>

        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Navigate to="/search" replace />} />
            <Route
              path="/search"
              element={
                <motion.div
                  key="search"
                  initial="exit"
                  animate="enter"
                  exit="exit"
                  variants={tabContentVariants}
                >
                  <Tabs.Content value="search">
                    <Search />
                  </Tabs.Content>
                </motion.div>
              }
            />
            <Route
              path="/yt-search"
              element={
                <motion.div
                  key="youtube"
                  initial="exit"
                  animate="enter"
                  exit="exit"
                  variants={tabContentVariants}
                >
                  <Tabs.Content value="youtube">
                    <YoutubeSearch />
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
