import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CustomSearch from "./components/CustomSearch";
import BetaSearch from "./components/BetaSearch";
import { Switch } from "./components/ui/switch";

function App() {
  const [isBeta, setIsBeta] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <nav className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm font-medium">Beta Search</span>
            <Switch
              checked={isBeta}
              onCheckedChange={(checked) => {
                setIsBeta(checked);
              }}
            />
          </div>
        </nav>

        <Routes>
          <Route
            path="/"
            element={isBeta ? <BetaSearch /> : <CustomSearch />}
          />
          <Route path="/beta" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
