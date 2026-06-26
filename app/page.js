import React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import LiteHeroCarousel from "@/components/lite/LiteHeroCarousel";
import RecentlyWatched from "@/components/lite/RecentlyWatched";
import WatchlistSection from "@/components/lite/WatchlistSection";
import MediaRow from "@/components/lite/MediaRow";
import Link from "next/link";

import { Moon } from "lucide-react";
import Image from "next/image";

async function getTrending() {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey || apiKey === "dummy") return [];
  try {
    const resp = await fetch(
      `https://api.themoviedb.org/3/trending/all/day?language=en-US&api_key=${apiKey}`,
      {
        next: {
          revalidate: 3600,
        },
      },
    );

    if (!resp.ok) {
      return [];
    }
    const data = await resp.json();
    return data.results || [];
  } catch (e) {
    return [];
  }
}

async function getPopularMovies() {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey || apiKey === "dummy") return [];
  try {
    const resp = await fetch(
      `https://api.themoviedb.org/3/movie/popular?language=en-US&api_key=${apiKey}`,
      {
        next: {
          revalidate: 3600,
        },
      },
    );

    if (!resp.ok) return [];
    const data = await resp.json();
    return data.results || [];
  } catch (e) {
    return [];
  }
}

async function getPopularSeries() {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey || apiKey === "dummy") return [];
  try {
    const resp = await fetch(
      `https://api.themoviedb.org/3/tv/popular?language=en-US&api_key=${apiKey}`,
      {
        next: {
          revalidate: 3600,
        },
      },
    );

    if (!resp.ok) return [];
    const data = await resp.json();
    return data.results || [];
  } catch (e) {
    return [];
  }
}

export default async function LiteHome() {
  const [trending, popularMovies, popularSeries] = await Promise.all([
    getTrending(),
    getPopularMovies(),
    getPopularSeries(),
  ]);

  return (
    <Container maxWidth={false} sx={{ py: 4, px: 8 }}>
      {/* Brand Header */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontWeight: 900,
              color: "primary.main",
              letterSpacing: "-0.5px",
            }}
          >
            <Link
              href="/"
              className="group flex items-center gap-2 select-none"
              aria-label="Crescent Moon Home"
            >
              {/* Icon Container - Material Surface Style */}
              <div className="relative flex items-bottom justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-transparent text-black transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                <Image src="/logo.svg" alt="alt" width={100} height={100} />
                {/* Decorative blur for glow effect */}
                <div className="absolute inset-0 bg-white blur-lg opacity-40 group-hover:opacity-50 transition-opacity" />
              </div>

              {/* Typography - Swiss Style (Tight tracking, mixed weights, uppercase) */}
              <div className="flex flex-col justify-center leading-none font-display">
                <span className="text-lg md:text-2xl font-bold tracking-tighter text-white uppercase group-hover:tracking-normal transition-all duration-500">
                  Crescent
                </span>
                <span className="text-[10px] md:text-xs font-light tracking-[0.2em] text-neutral-400 uppercase group-hover:text-white transition-colors duration-300">
                  Moon
                </span>
              </div>
            </Link>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Minimalist, fast streaming experience.
          </Typography>
        </Box>
      </Box>

      {/* Hero Carousel */}
      {trending.length > 0 && <LiteHeroCarousel items={trending} />}

      {/* Watch History ("Recently Watched") */}
      <RecentlyWatched />

      {/* Watchlist Section */}
      <WatchlistSection />

      {/* Trending shelf */}
      <MediaRow title="Trending Now" items={trending} />

      {/* Popular Movies shelf */}
      <MediaRow title="Popular Movies" items={popularMovies} type="movie" />

      {/* Popular Series shelf */}
      <MediaRow title="Popular Series" items={popularSeries} type="tv" />

      {trending.length === 0 &&
        popularMovies.length === 0 &&
        popularSeries.length === 0 && (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <Typography color="text.secondary">
              No content available at the moment.
            </Typography>
          </Box>
        )}
    </Container>
  );
}
