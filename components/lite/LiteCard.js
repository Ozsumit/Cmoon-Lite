"use client";
import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";
import Box from "@mui/material/Box";
import Link from "next/link";
import { Play, Star } from "lucide-react";

export default function LiteCard({ item }) {
  const title = item.title || item.name || "Untitled";
  const posterPath = item.poster_path
    ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
    : "https://via.placeholder.com/342x513?text=No+Poster";
  const mediaType = item.media_type || (item.first_air_date ? "tv" : "movie");
  const href = `/${mediaType === "tv" ? "series" : "movie"}/${item.id}`;
  const year = (item.release_date || item.first_air_date || "").split("-")[0];
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

  return (
    <Card
      sx={{
        maxWidth: 400,
        backgroundColor: "background.paper",
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 12px 30px rgba(0, 0, 0, 0.6)",
          borderColor: "rgba(208, 188, 255, 0.2)",
        },
      }}
    >
      <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
        <CardActionArea>
          <Box sx={{ position: "relative", overflow: "hidden", aspectRatio: "2/3" }}>
            <CardMedia
              component="img"
              image={posterPath}
              alt={title}
              loading="lazy"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.5s ease",
                ".MuiCardActionArea-root:hover &": {
                  transform: "scale(1.08)",
                },
              }}
            />
            {/* Dark gradient overlay at the bottom of poster */}
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "40%",
                background: "linear-gradient(to top, rgba(28, 27, 31, 0.8), transparent)",
                pointerEvents: "none",
              }}
            />
            {/* Glassmorphic Play Overlay */}
            <Box
              className="play-overlay"
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(28, 27, 31, 0.4)",
                backdropFilter: "blur(2px)",
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
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  backgroundColor: "primary.main",
                  color: "background.default",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 16px rgba(208, 188, 255, 0.5)",
                  transform: "scale(0.8)",
                  transition: "transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                  ".MuiCardActionArea-root:hover .play-overlay &": {
                    transform: "scale(1)",
                  },
                }}
              >
                <Play size={22} fill="currentColor" style={{ marginLeft: 2 }} />
              </Box>
            </Box>

            {/* Floating Badge (Rating or Media Type) */}
            {rating && (
              <Box
                sx={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 1,
                  py: 0.5,
                  borderRadius: "8px",
                  backgroundColor: "rgba(28, 27, 31, 0.85)",
                  backdropFilter: "blur(4px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <Star size={12} fill="#FFD700" color="#FFD700" />
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#FFD700", fontSize: "0.75rem", lineHeight: 1 }}>
                  {rating}
                </Typography>
              </Box>
            )}
          </Box>
          <CardContent sx={{ p: 1.5, minHeight: "80px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <Typography
              gutterBottom
              variant="subtitle2"
              component="div"
              noWrap
              sx={{ fontWeight: 700, mb: 0.5, color: "text.primary" }}
            >
              {title}
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
                {year || "N/A"}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: "6px",
                  backgroundColor: "secondary.container",
                  color: "secondary.onContainer",
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {mediaType === "tv" ? "Series" : "Movie"}
              </Typography>
            </Box>
          </CardContent>
        </CardActionArea>
      </Link>
    </Card>
  );
}
