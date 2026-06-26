"use client";
import React, { useRef, useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import LiteCard from "./LiteCard";

export default function MediaRow({ title, items = [], type }) {
  const rowRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    const el = rowRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      checkScroll();
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [items]);

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const { clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <Box sx={{ mb: 6, position: "relative" }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, px: 1, letterSpacing: "0.2px" }}>
        {title}
      </Typography>

      <Box
        className="group"
        sx={{
          position: "relative",
          mx: -1,
        }}
      >
        {/* Left Arrow Button */}
        {showLeftArrow && (
          <IconButton
            onClick={() => handleScroll("left")}
            sx={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              backgroundColor: "rgba(28, 27, 31, 0.8)",
              backdropFilter: "blur(8px)",
              color: "primary.main",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              opacity: 0,
              transition: "opacity 0.25s ease, background-color 0.2s ease, transform 0.2s ease",
              "&:hover": {
                backgroundColor: "rgba(28, 27, 31, 0.95)",
                transform: "translateY(-50%) scale(1.1)",
              },
              ".group:hover &": {
                opacity: 1,
              },
            }}
          >
            <ChevronLeft size={22} />
          </IconButton>
        )}

        {/* Right Arrow Button */}
        {showRightArrow && (
          <IconButton
            onClick={() => handleScroll("right")}
            sx={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              backgroundColor: "rgba(28, 27, 31, 0.8)",
              backdropFilter: "blur(8px)",
              color: "primary.main",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              opacity: 0,
              transition: "opacity 0.25s ease, background-color 0.2s ease, transform 0.2s ease",
              "&:hover": {
                backgroundColor: "rgba(28, 27, 31, 0.95)",
                transform: "translateY(-50%) scale(1.1)",
              },
              ".group:hover &": {
                opacity: 1,
              },
            }}
          >
            <ChevronRight size={22} />
          </IconButton>
        )}

        {/* Horizontal scrollbar-hidden element */}
        <Box
          ref={rowRef}
          sx={{
            display: "flex",
            gap: 2.5,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            pb: 2,
            px: 1,
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          {items.map((item) => (
            <Box
              key={item.id}
              sx={{
                flex: "0 0 auto",
                width: { xs: "150px", sm: "180px", md: "200px" },
                scrollSnapAlign: "start",
              }}
            >
              <LiteCard item={type ? { ...item, media_type: type } : item} />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
