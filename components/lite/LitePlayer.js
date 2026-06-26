"use client";
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Link from 'next/link';
import { 
  Maximize2, 
  Minimize2, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight, 
  Share2,
  Tv as TvIcon
} from 'lucide-react';

export default function LitePlayer({ 
  id, 
  servers, 
  type = 'movie', 
  season, 
  episode,
  title,
  posterPath,
  backdropPath,
  seasons = [],
  episodes = []
}) {
  const [currentServer, setCurrentServer] = useState(servers[0]);
  const [isTheater, setIsTheater] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const [isWatchlisted, setIsWatchlisted] = useState(false);

  // Load watchlist & theater preference on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedWatchlist = localStorage.getItem("cmoon_watchlist");
      if (savedWatchlist) {
        try {
          const parsed = JSON.parse(savedWatchlist);
          setWatchlist(parsed);
          setIsWatchlisted(parsed.some(item => item.id === id && item.type === type));
        } catch (e) {
          console.error(e);
        }
      }
      
      const savedTheater = localStorage.getItem("cmoon_theater_mode");
      if (savedTheater) {
        setIsTheater(savedTheater === "true");
      }
    }
  }, [id, type]);

  // Save history on media or episode change
  useEffect(() => {
    if (!id || !title) return;
    try {
      const historyKey = "cmoon_watch_history";
      const saved = localStorage.getItem(historyKey);
      let list = saved ? JSON.parse(saved) : [];
      
      list = list.filter(item => !(item.id === id && item.type === type));
      
      list.unshift({
        id,
        type,
        title,
        poster_path: posterPath,
        backdrop_path: backdropPath,
        season,
        episode,
        watchedAt: Date.now()
      });

      if (list.length > 20) {
        list = list.slice(0, 20);
      }

      localStorage.setItem(historyKey, JSON.stringify(list));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.error("Failed to save history", e);
    }
  }, [id, type, season, episode, title, posterPath, backdropPath]);

  // Toggle theater mode and persist preference
  const toggleTheater = () => {
    const nextVal = !isTheater;
    setIsTheater(nextVal);
    localStorage.setItem("cmoon_theater_mode", nextVal.toString());
  };

  // Watchlist toggle handler
  const toggleWatchlist = () => {
    let updated;
    if (isWatchlisted) {
      updated = watchlist.filter(item => !(item.id === id && item.type === type));
      setIsWatchlisted(false);
    } else {
      updated = [
        ...watchlist,
        {
          id,
          type,
          title,
          poster_path: posterPath,
          backdrop_path: backdropPath,
          watchedAt: Date.now()
        }
      ];
      setIsWatchlisted(true);
    }
    setWatchlist(updated);
    localStorage.setItem("cmoon_watchlist", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  };

  // Copy shareable page URL
  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      alert("Page link copied to clipboard!");
    }
  };

  const getEmbedUrl = (server) => {
    let baseUrl = server.url;
    if (!baseUrl.endsWith('/')) {
      baseUrl += '/';
    }

    if (server.paramStyle === 'path-slash') {
      if (type === 'tv') {
        return `${baseUrl}${id}/${season}/${episode}`;
      }
      return `${baseUrl}${id}`;
    } else if (server.paramStyle === 'query') {
      if (type === 'tv') {
        return `${baseUrl}?id=${id}&s=${season}&e=${episode}`;
      }
      return `${baseUrl}?id=${id}`;
    } else if (server.paramStyle === 'path-hyphen-mapi') {
       if (type === 'tv') {
        return `${baseUrl}${id}-${season}-${episode}`;
      }
      return `${baseUrl}${id}`;
    }

    return `${baseUrl}${id}`;
  };

  // Compute Next / Prev Episode navigation URLs
  let prevUrl = null;
  let nextUrl = null;

  if (type === "tv") {
    if (episode > 1) {
      prevUrl = `/series/${id}?s=${season}&e=${episode - 1}`;
    } else if (season > 1) {
      prevUrl = `/series/${id}?s=${season - 1}&e=1`;
    }

    if (episode < episodes.length) {
      nextUrl = `/series/${id}?s=${season}&e=${episode + 1}`;
    } else {
      const hasNextSeason = seasons.some(s => s.season_number === season + 1);
      if (hasNextSeason) {
        nextUrl = `/series/${id}?s=${season + 1}&e=1`;
      }
    }
  }

  // Wrapper responsive styles for Theater breakout mode
  const outerWrapperStyles = isTheater
    ? {
        width: '100vw',
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        backgroundColor: '#000',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        mb: 4
      }
    : {
        width: '100%',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        mb: 4
      };

  const playerBoxStyles = isTheater
    ? {
        position: 'relative',
        width: '100%',
        aspectRatio: { xs: '16/9', md: '21/9' },
        maxHeight: '75vh',
        backgroundColor: '#000',
        overflow: 'hidden',
      }
    : {
        position: 'relative',
        width: '100%',
        paddingTop: '56.25%', // 16:9 Aspect Ratio
        borderRadius: '20px',
        overflow: 'hidden',
        backgroundColor: '#000',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Video Player Frame Wrapper */}
      <Box sx={outerWrapperStyles}>
        <Box sx={playerBoxStyles}>
          <iframe
            src={getEmbedUrl(currentServer)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            allowFullScreen
          />
        </Box>
      </Box>

      {/* Main Controls row */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        mb: 4
      }}>
        {/* Left: Server selections pills */}
        <Box sx={{ display: 'flex', flexGrow: 1, flexDirection: 'column', gap: 1, maxWidth: { xs: '100%', md: '90%' } }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <TvIcon size={14} /> Sources
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            overflowX: 'auto', 
            pb: 1, 
            scrollbarWidth: 'none', 
            '&::-webkit-scrollbar': { display: 'none' } 
          }}>
            {servers.map((server) => {
              const isActive = currentServer.name === server.name;
              return (
                <Button
                  key={server.name}
                  variant={isActive ? "contained" : "outlined"}
                  size="small"
                  onClick={() => setCurrentServer(server)}
                  sx={{
                    borderRadius: '20px',
                    px: 2.2,
                    py: 0.6,
                    minWidth: 'fit-content',
                    whiteSpace: 'nowrap',
                    borderColor: isActive ? 'primary.main' : 'rgba(255,255,255,0.15)',
                    color: isActive ? 'background.default' : 'text.primary',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: isActive ? 'primary.main' : 'rgba(255,255,255,0.04)'
                    }
                  }}
                >
                  {server.name}
                </Button>
              );
            })}
          </Box>
        </Box>

        {/* Right: Watchlist / Share / Theater Buttons */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mt: { xs: 1, md: 0 } }}>
          {/* Watchlist Bookmark */}
          <Tooltip title={isWatchlisted ? "Remove Watchlist" : "Add Watchlist"}>
            <IconButton
              onClick={toggleWatchlist}
              sx={{
                color: isWatchlisted ? 'primary.main' : 'text.secondary',
                border: '1px solid',
                borderColor: isWatchlisted ? 'primary.main' : 'rgba(255, 255, 255, 0.1)',
                backgroundColor: isWatchlisted ? 'rgba(208, 188, 255, 0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(208, 188, 255, 0.15)',
                }
              }}
            >
              <Bookmark size={18} fill={isWatchlisted ? 'currentColor' : 'none'} />
            </IconButton>
          </Tooltip>

          {/* Copy Link */}
          <Tooltip title="Copy Link">
            <IconButton
              onClick={handleShare}
              sx={{
                color: 'text.secondary',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                }
              }}
            >
              <Share2 size={18} />
            </IconButton>
          </Tooltip>

          {/* Theater mode toggle */}
          <Tooltip title={isTheater ? "Normal Mode" : "Theater Mode"}>
            <IconButton
              onClick={toggleTheater}
              sx={{
                color: isTheater ? 'primary.main' : 'text.secondary',
                border: '1px solid',
                borderColor: isTheater ? 'primary.main' : 'rgba(255, 255, 255, 0.1)',
                backgroundColor: isTheater ? 'rgba(208, 188, 255, 0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(208, 188, 255, 0.15)',
                }
              }}
            >
              {isTheater ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Episode Navigation Buttons */}
      {type === "tv" && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'background.paper',
            p: 2,
            mb: 4,
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.04)',
          }}
        >
          <Link href={prevUrl || "#"} style={{ pointerEvents: prevUrl ? 'auto' : 'none', textDecoration: 'none' }}>
            <Button
              variant="outlined"
              size="small"
              disabled={!prevUrl}
              startIcon={<ChevronLeft size={16} />}
              sx={{ borderRadius: '20px', textTransform: 'none' }}
            >
              Prev Episode
            </Button>
          </Link>

          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            Season {season}, Episode {episode}
          </Typography>

          <Link href={nextUrl || "#"} style={{ pointerEvents: nextUrl ? 'auto' : 'none', textDecoration: 'none' }}>
            <Button
              variant="contained"
              size="small"
              disabled={!nextUrl}
              endIcon={<ChevronRight size={16} />}
              sx={{ borderRadius: '20px', textTransform: 'none' }}
            >
              Next Episode
            </Button>
          </Link>
        </Box>
      )}
    </Box>
  );
}
