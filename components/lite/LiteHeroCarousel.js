"use client";
import React, { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Link from "next/link";
import { Play, Plus, Check, Star, ChevronLeft, ChevronRight } from "lucide-react";

export default function LiteHeroCarousel({ items = [] }) {
  const carouselItems = items.slice(0, 5);
  const [activeIndex, setActiveIndex] = useState(0);
  const [watchlist, setWatchlist] = useState([]);
  const autoPlayRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cmoon_watchlist");
      if (saved) setWatchlist(JSON.parse(saved));
    }
  }, []);

  const startAutoPlay = () => {
    stopAutoPlay();
    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % carouselItems.length);
    }, 6000);
  };

  const stopAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  useEffect(() => {
    if (carouselItems.length > 0) {
      startAutoPlay();
    }
    return () => stopAutoPlay();
  }, [carouselItems.length]);

  if (carouselItems.length === 0) return null;

  const currentItem = carouselItems[activeIndex];
  const title = currentItem.title || currentItem.name || "Untitled";
  const mediaType = currentItem.media_type || (currentItem.first_air_date ? "tv" : "movie");
  const href = `/${mediaType === "tv" ? "series" : "movie"}/${currentItem.id}`;
  const rating = currentItem.vote_average ? currentItem.vote_average.toFixed(1) : null;
  const overview = currentItem.overview || "";

  const isWatchlisted = watchlist.some(
    (w) => w.id === currentItem.id && w.type === mediaType
  );

  const toggleWatchlist = () => {
    let updated;
    if (isWatchlisted) {
      updated = watchlist.filter(
        (w) => !(w.id === currentItem.id && w.type === mediaType)
      );
    } else {
      updated = [
        ...watchlist,
        {
          id: currentItem.id,
          type: mediaType,
          title,
          poster_path: currentItem.poster_path,
          backdrop_path: currentItem.backdrop_path,
          vote_average: currentItem.vote_average,
          release_date: currentItem.release_date || currentItem.first_air_date,
        },
      ];
    }
    setWatchlist(updated);
    localStorage.setItem("cmoon_watchlist", JSON.stringify(updated));
  };

  return (
    <Box
      onMouseEnter={stopAutoPlay}
      onMouseLeave={startAutoPlay}
      sx={{
        position: "relative",
        width: "100%",
        height: { xs: "360px", sm: "440px", md: "520px" },
        borderRadius: "24px",
        overflow: "hidden",
        backgroundColor: "#121212",
        mb: 6,
        border: "1px solid rgba(255, 255, 255, 0.06)",
        boxShadow: "0 12px 36px rgba(0, 0, 0, 0.6)",
      }}
    >
      {/* Background Images with Cross-Fade Transition */}
      {carouselItems.map((item, idx) => {
        const bgUrl = item.backdrop_path
          ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
          : "https://via.placeholder.com/1920x1080?text=No+Preview";
        return (
          <Box
            key={item.id}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundImage: `url(${bgUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center 20%",
              opacity: idx === activeIndex ? 1 : 0,
              transition: "opacity 1s ease-in-out",
              zIndex: 1,
            }}
          />
        );
      })}

      {/* Dynamic Overlay Mask (Linear and Radial Gradients) */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: {
            xs: "linear-gradient(to top, #1C1B1F 15%, rgba(28,27,31,0.75) 55%, rgba(28,27,31,0.2) 100%)",
            md: "linear-gradient(to right, #1C1B1F 35%, rgba(28,27,31,0.6) 70%, transparent 100%), linear-gradient(to top, #1C1B1F 5%, rgba(28,27,31,0.2) 30%, transparent 100%)",
          },
          zIndex: 2,
        }}
      />

      {/* Navigation Arrow buttons */}
      <IconButton
        onClick={() => setActiveIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length)}
        sx={{
          position: "absolute",
          left: 16,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 4,
          backgroundColor: "rgba(28, 27, 31, 0.4)",
          backdropFilter: "blur(8px)",
          color: "white",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          display: { xs: "none", md: "flex" },
          "&:hover": {
            backgroundColor: "rgba(28, 27, 31, 0.8)",
            color: "primary.main",
            borderColor: "primary.main",
          },
        }}
      >
        <ChevronLeft size={20} />
      </IconButton>
      <IconButton
        onClick={() => setActiveIndex((prev) => (prev + 1) % carouselItems.length)}
        sx={{
          position: "absolute",
          right: 16,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 4,
          backgroundColor: "rgba(28, 27, 31, 0.4)",
          backdropFilter: "blur(8px)",
          color: "white",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          display: { xs: "none", md: "flex" },
          "&:hover": {
            backgroundColor: "rgba(28, 27, 31, 0.8)",
            color: "primary.main",
            borderColor: "primary.main",
          },
        }}
      >
        <ChevronRight size={20} />
      </IconButton>

      {/* Detail Content Overlay */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: { xs: "100%", md: "60%" },
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          p: { xs: 3, sm: 4, md: 5 },
          zIndex: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
          <Typography
            variant="caption"
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: "8px",
              backgroundColor: "primary.main",
              color: "background.default",
              fontWeight: 850,
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: "1px",
              boxShadow: "0 2px 8px rgba(208, 188, 255, 0.4)",
            }}
          >
            {mediaType === "tv" ? "TV Show" : "Movie"}
          </Typography>
          {rating && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Star size={14} fill="#FFD700" color="#FFD700" />
              <Typography variant="body2" sx={{ fontWeight: 700, color: "#FFD700" }}>
                {rating}
              </Typography>
            </Box>
          )}
        </Box>

        <Typography
          variant="h3"
          component="h2"
          sx={{
            fontWeight: 900,
            mb: 1.5,
            fontSize: { xs: "1.8rem", sm: "2.4rem", md: "3rem" },
            lineHeight: 1.1,
            color: "text.primary",
            textShadow: "0 3px 6px rgba(0,0,0,0.7)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            mb: 3.5,
            lineHeight: 1.6,
            display: "-webkit-box",
            WebkitLineClamp: { xs: 2, sm: 3 },
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            fontSize: { xs: "0.85rem", sm: "0.92rem" },
            textShadow: "0 2px 4px rgba(0,0,0,0.6)",
          }}
        >
          {overview}
        </Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Link href={href} style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Play size={18} fill="currentColor" />}
              sx={{
                px: 4,
                py: 1.25,
                borderRadius: "24px",
                fontSize: "0.95rem",
                fontWeight: 700,
                boxShadow: "0 4px 18px rgba(208, 188, 255, 0.45)",
                "&:hover": {
                  boxShadow: "0 6px 24px rgba(208, 188, 255, 0.65)",
                },
              }}
            >
              Watch Now
            </Button>
          </Link>
          <Button
            variant="outlined"
            size="large"
            onClick={toggleWatchlist}
            startIcon={isWatchlisted ? <Check size={18} /> : <Plus size={18} />}
            sx={{
              px: 4,
              py: 1.25,
              borderRadius: "24px",
              fontSize: "0.95rem",
              fontWeight: 700,
              borderColor: "rgba(255, 255, 255, 0.35)",
              color: "white",
              "&:hover": {
                borderColor: "white",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
              },
            }}
          >
            {isWatchlisted ? "In Watchlist" : "Watchlist"}
          </Button>
        </Box>
      </Box>

      {/* Progress Dots indicators */}
      <Box
        sx={{
          position: "absolute",
          bottom: 24,
          right: { xs: 0, md: 40 },
          left: { xs: 0, md: "auto" },
          display: "flex",
          justifyContent: "center",
          gap: 1.2,
          zIndex: 3,
        }}
      >
        {carouselItems.map((_, idx) => (
          <Box
            key={idx}
            onClick={() => setActiveIndex(idx)}
            sx={{
              width: idx === activeIndex ? 26 : 8,
              height: 8,
              borderRadius: "4px",
              backgroundColor: idx === activeIndex ? "primary.main" : "rgba(255, 255, 255, 0.3)",
              cursor: "pointer",
              transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease",
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
