"use client";
import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Link from "next/link";
import { Play, X, RotateCcw } from "lucide-react";

export default function RecentlyWatched() {
  const [history, setHistory] = useState([]);

  const loadHistory = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cmoon_watch_history");
      if (saved) {
        try {
          setHistory(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse watch history", e);
        }
      }
    }
  };

  useEffect(() => {
    loadHistory();
    window.addEventListener("storage", loadHistory);
    return () => window.removeEventListener("storage", loadHistory);
  }, []);

  const handleRemove = (e, id, type) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = history.filter((item) => !(item.id === id && item.type === type));
    setHistory(updated);
    localStorage.setItem("cmoon_watch_history", JSON.stringify(updated));
  };

  if (history.length === 0) return null;

  return (
    <Box sx={{ mb: 6 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, px: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "0.2px" }}>
          Recently Watched
        </Typography>
        <Typography
          variant="caption"
          sx={{
            cursor: "pointer",
            color: "primary.main",
            fontWeight: 600,
            "&:hover": { textDecoration: "underline" },
          }}
          onClick={() => {
            if (confirm("Clear all watch history?")) {
              setHistory([]);
              localStorage.removeItem("cmoon_watch_history");
            }
          }}
        >
          Clear All
        </Typography>
      </Box>

      {/* Horizontal Scroll Shelf */}
      <Box
        sx={{
          display: "flex",
          gap: 2.5,
          overflowX: "auto",
          pb: 2,
          px: 1,
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {history.map((item) => {
          const title = item.title || "Untitled";
          const posterPath = item.poster_path
            ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
            : "https://via.placeholder.com/342x513?text=No+Poster";
          
          const href = item.type === "tv"
            ? `/series/${item.id}?s=${item.season || 1}&e=${item.episode || 1}`
            : `/movie/${item.id}`;

          return (
            <Box
              key={`${item.type}-${item.id}`}
              sx={{
                flex: "0 0 auto",
                width: { xs: "150px", sm: "180px", md: "200px" },
                position: "relative",
              }}
            >
              <Card
                sx={{
                  backgroundColor: "background.paper",
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
                    borderColor: "rgba(208, 188, 255, 0.2)",
                  },
                }}
              >
                {/* Dismiss Button */}
                <IconButton
                  onClick={(e) => handleRemove(e, item.id, item.type)}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    zIndex: 10,
                    width: 26,
                    height: 26,
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    color: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(4px)",
                    "&:hover": {
                      backgroundColor: "rgba(211, 47, 47, 0.95)",
                      color: "white",
                    },
                  }}
                  size="small"
                >
                  <X size={14} />
                </IconButton>

                <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
                  <CardActionArea>
                    <Box sx={{ position: "relative", overflow: "hidden", aspectRatio: "2/3" }}>
                      <CardMedia
                        component="img"
                        image={posterPath}
                        alt={title}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      {/* Play Resume Overlay */}
                      <Box
                        className="play-overlay"
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: "rgba(28, 27, 31, 0.4)",
                          backdropFilter: "blur(2.5px)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: 0,
                          transition: "opacity 0.25s ease",
                          ".MuiCardActionArea-root:hover &": {
                            opacity: 1,
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            backgroundColor: "primary.main",
                            color: "background.default",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 4px 12px rgba(208, 188, 255, 0.4)",
                          }}
                        >
                          <Play size={20} fill="currentColor" style={{ marginLeft: 2 }} />
                        </Box>
                      </Box>

                      {/* TV Show Episode Tag */}
                      {item.type === "tv" && (
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: 8,
                            left: 8,
                            px: 1,
                            py: 0.4,
                            borderRadius: "6px",
                            backgroundColor: "rgba(28, 27, 31, 0.85)",
                            backdropFilter: "blur(4px)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 800, color: "primary.main", fontSize: "0.7rem" }}
                          >
                            S{item.season} E{item.episode}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <CardContent sx={{ p: 1.5, minHeight: "76px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <Typography
                        variant="subtitle2"
                        noWrap
                        sx={{ fontWeight: 700, mb: 0.5, color: "text.primary" }}
                      >
                        {title}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <RotateCcw size={12} color="#938F99" />
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
                          Resume Play
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Link>
              </Card>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
