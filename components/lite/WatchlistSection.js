"use client";
import React, { useState, useEffect } from "react";
import MediaRow from "./MediaRow";

export default function WatchlistSection() {
  const [watchlist, setWatchlist] = useState([]);

  const loadWatchlist = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cmoon_watchlist");
      if (saved) {
        try {
          setWatchlist(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse watchlist", e);
        }
      }
    }
  };

  useEffect(() => {
    loadWatchlist();
    // Allow synchronization across multiple open tabs
    window.addEventListener("storage", loadWatchlist);
    return () => window.removeEventListener("storage", loadWatchlist);
  }, []);

  if (watchlist.length === 0) return null;

  return <MediaRow title="My Watchlist" items={watchlist} />;
}
