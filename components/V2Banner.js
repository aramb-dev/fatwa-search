"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ArrowRight,
  Lock,
  Zap,
  Sparkles,
  Users,
  Wrench,
  BookOpen,
} from "lucide-react";
import { cn } from "../lib/utils";

const V2Banner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Check if the banner has been dismissed
    const dismissed = localStorage.getItem("v2-banner-dismissed");
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("v2-banner-dismissed", "true");
  };

  const handleVisitNewSite = () => {
    window.open("https://search.aramb.dev", "_blank");
  };

  const bannerVariants = {
    initial: { opacity: 0, y: -20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
      },
    },
  };

  const contentVariants = {
    collapsed: {
      height: "auto",
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    expanded: {
      height: "auto",
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={bannerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full max-w-6xl mx-auto mb-6"
        >
          <div
            className={cn(
              "relative overflow-hidden",
              "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600",
              "rounded-xl shadow-2xl border-2 border-white/20",
            )}
          >
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className={cn(
                "absolute top-3 right-3 z-20",
                "p-1.5 rounded-lg",
                "bg-white/10 hover:bg-white/20",
                "text-white transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-white/50",
              )}
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative z-10 p-6">
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0">
                  <Sparkles className="h-8 w-8 text-yellow-300" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-1">
                    🎉 We&apos;re Moving to a New Home!
                  </h2>
                  <p className="text-blue-100 text-sm">
                    Fatwa Search v2 is now live at{" "}
                    <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded">
                      search.aramb.dev
                    </span>
                  </p>
                </div>
              </div>

              {/* Migration notice */}
              <div className="bg-yellow-400/20 border border-yellow-300/30 rounded-lg p-3 mb-4">
                <p className="text-white text-sm font-medium">
                  ⚠️ <span className="font-bold">Important:</span>{" "}
                  is-search.aramb.dev will be deprecated soon. Please update
                  your bookmarks to{" "}
                  <span className="font-semibold">search.aramb.dev</span>
                </p>
              </div>

              {/* CTA Button */}
              <div className="flex gap-3 mb-4">
                <button
                  onClick={handleVisitNewSite}
                  className={cn(
                    "flex-1 sm:flex-none",
                    "px-6 py-3 rounded-lg",
                    "bg-white text-indigo-600",
                    "font-semibold text-sm",
                    "hover:bg-blue-50 transition-all",
                    "shadow-lg hover:shadow-xl",
                    "focus:outline-none focus:ring-2 focus:ring-white/50",
                    "flex items-center justify-center gap-2",
                  )}
                >
                  Visit New Site
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={cn(
                    "px-4 py-3 rounded-lg",
                    "bg-white/10 hover:bg-white/20",
                    "text-white font-medium text-sm",
                    "transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-white/50",
                  )}
                >
                  {isExpanded ? "Show Less" : "What's New?"}
                </button>
              </div>

              {/* Expandable content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 border-t border-white/20">
                      <h3 className="text-lg font-bold text-white mb-3">
                        What&apos;s New in V2
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {/* Feature 1 */}
                        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                          <div className="flex items-start gap-2">
                            <Lock className="h-5 w-5 text-green-300 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-white text-sm mb-1">
                                More Secure
                              </h4>
                              <p className="text-blue-100 text-xs">
                                Enterprise-level security with server-side API
                                keys
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                          <div className="flex items-start gap-2">
                            <Zap className="h-5 w-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-white text-sm mb-1">
                                Blazing Fast
                              </h4>
                              <p className="text-blue-100 text-xs">
                                Up to 3x faster with smart caching and parallel
                                searches
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                          <div className="flex items-start gap-2">
                            <Sparkles className="h-5 w-5 text-pink-300 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-white text-sm mb-1">
                                Better Experience
                              </h4>
                              <p className="text-blue-100 text-xs">
                                Beautiful animations, helpful guidance, and
                                clearer errors
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Feature 4 */}
                        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                          <div className="flex items-start gap-2">
                            <Users className="h-5 w-5 text-purple-300 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-white text-sm mb-1">
                                More Accessible
                              </h4>
                              <p className="text-blue-100 text-xs">
                                Keyboard-friendly and screen reader ready
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Feature 5 */}
                        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                          <div className="flex items-start gap-2">
                            <Wrench className="h-5 w-5 text-orange-300 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-white text-sm mb-1">
                                More Reliable
                              </h4>
                              <p className="text-blue-100 text-xs">
                                Crash protection and cleaner, more stable
                                codebase
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Feature 6 */}
                        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                          <div className="flex items-start gap-2">
                            <BookOpen className="h-5 w-5 text-blue-300 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-white text-sm mb-1">
                                For Developers
                              </h4>
                              <p className="text-blue-100 text-xs">
                                Complete docs and code comments for easy
                                contributions
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                        <p className="text-white text-sm font-medium text-center">
                          ✨ The Result? A faster, more reliable, and more
                          accessible Islamic knowledge search experience for
                          everyone.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default V2Banner;
