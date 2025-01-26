import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Search from "./components/Search";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-gray-50 py-8 px-4">
              <Search />
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;