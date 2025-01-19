import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import CustomSearch from "./components/CustomSearch";
import BetaSearch from "./components/BetaSearch";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <nav className="max-w-4xl mx-auto mb-8">
          <div className="flex gap-4 justify-center">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 underline"
            >
              Classic Search
            </Link>
            <Link
              to="/beta"
              className="text-gray-600 hover:text-gray-900 underline"
            >
              Beta Search
            </Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<CustomSearch />} />
          <Route path="/beta" element={<BetaSearch />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
