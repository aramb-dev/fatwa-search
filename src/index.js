import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import clarity from "@microsoft/clarity";
import ReactGA from "react-ga4";

// Initialize Clarity
clarity.init(process.env.REACT_APP_CLARITY_ID);

// Initialize Google Analytics
ReactGA.initialize("G-20KVLCSQEJ");

// Track initial pageview
ReactGA.send("pageview");

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
