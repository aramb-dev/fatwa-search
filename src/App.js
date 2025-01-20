import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import CustomSearch from "./components/CustomSearch";
import BetaSearch from "./components/BetaSearch";
import { Switch } from "./components/ui/switch";

function App() {
  // Initialize state from localStorage or URL path
  const [isBeta, setIsBeta] = useState(() => {
    const saved = localStorage.getItem("useBetaSearch");
    return saved ? JSON.parse(saved) : false;
  });

  // Handle beta toggle
  const handleBetaToggle = (checked) => {
    setIsBeta(checked);
    localStorage.setItem("useBetaSearch", JSON.stringify(checked));
  };

  // Inner component to handle route changes
  const AppContent = () => {
    const location = useLocation();

    useEffect(() => {
      if (location.pathname === "/beta" && !isBeta) {
        handleBetaToggle(true);
      }
    }, [location.pathname]);

    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <nav className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm font-medium">Beta Search</span>
            <Switch checked={isBeta} onCheckedChange={handleBetaToggle} />
          </div>
        </nav>

        {isBeta ? <BetaSearch /> : <CustomSearch />}
      </div>
    );
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
