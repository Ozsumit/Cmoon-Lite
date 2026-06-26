import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import LitePlayer from '@/components/lite/LitePlayer';
import MediaRow from '@/components/lite/MediaRow';
import { TV_SERVERS } from '@/lib/config';
import { getVideoSources } from '@/lib/video-sources';
import Link from 'next/link';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';

async function getSeries(id) {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey || apiKey === "dummy") return null;
  const url = `https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&append_to_response=credits`;
  const res = await fetch(url, { next: { revalidate: 1800 } });
  if (!res.ok) return null;
  return res.json();
}

async function getSeason(id, seasonNum) {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey || apiKey === "dummy") return null;
  const url = `https://api.themoviedb.org/3/tv/${id}/season/${seasonNum}?api_key=${apiKey}`;
  const res = await fetch(url, { next: { revalidate: 1800 } });
  if (!res.ok) return null;
  return res.json();
}

async function getRecommendations(id) {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey || apiKey === "dummy") return [];
  const url = `https://api.themoviedb.org/3/tv/${id}/recommendations?api_key=${apiKey}&language=en-US&page=1`;
  try {
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch (e) {
    return [];
  }
}

export default async function LiteSeriesPage({ params, searchParams }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const resolvedSearchParams = await searchParams;
  const s = parseInt(resolvedSearchParams.s || '1');
  const e = parseInt(resolvedSearchParams.e || '1');

  const series = await getSeries(id);
  if (!series) {
    if (process.env.NEXT_PUBLIC_TMDB_API_KEY === "dummy") {
      return (
        <Container sx={{ py: 8, textAlign: 'center' }}>
          <Typography>Running in build/dummy mode. No series data.</Typography>
        </Container>
      );
    }
    return <Container sx={{ py: 8, textAlign: 'center' }}><Typography>Series not found</Typography></Container>;
  }

  const [season, recommendations, dbServers] = await Promise.all([
    getSeason(id, s),
    getRecommendations(id),
    getVideoSources("tv")
  ]);
  const episodes = season?.episodes || [];
  const servers = dbServers && dbServers.length > 0 ? dbServers : TV_SERVERS;

  return (
    <Box sx={{ position: "relative", minHeight: "100vh" }}>
      {/* Immersive cinematic background glow */}
      {series.backdrop_path && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "450px",
            backgroundImage: `url(https://image.tmdb.org/t/p/original${series.backdrop_path})`,
            backgroundSize: "cover",
            backgroundPosition: "center 20%",
            filter: "blur(18px) brightness(0.25)",
            opacity: 0.15,
            zIndex: -1,
            maskImage: "linear-gradient(to bottom, black 30%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 30%, transparent 100%)",
          }}
        />
      )}

      {/* Video Player Section (Theater Mode Support) */}
      <Box sx={{ width: "100%", mx: "auto", px: { xs: 0, md: 4 }, py: { xs: 0, md: 3 } }}>
        <LitePlayer 
          id={id} 
          servers={servers} 
          type="tv" 
          season={s} 
          episode={e}
          title={series.name}
          posterPath={series.poster_path}
          backdropPath={series.backdrop_path}
          seasons={series.seasons}
          episodes={episodes}
        />
      </Box>

      {/* Series Details Container */}
      <Container sx={{ pb: 6, px: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ mt: 1 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 900, mb: 1.5, letterSpacing: "-0.5px" }}>
            {series.name}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
            <Chip 
              label={`Season ${s}`} 
              size="small" 
              color="primary"
              sx={{ fontWeight: 700, borderRadius: '6px' }}
            />
            <Chip 
              label={`Episode ${e}`} 
              size="small" 
              variant="outlined"
              sx={{ borderColor: 'primary.main', color: 'primary.main', fontWeight: 700, borderRadius: '6px' }}
            />
            <Chip 
              label={series.first_air_date?.slice(0, 4) || "N/A"} 
              size="small" 
              variant="outlined" 
              sx={{ borderColor: 'rgba(255,255,255,0.15)', borderRadius: '6px' }}
            />
            {series.vote_average > 0 && (
              <Chip 
                label={`${series.vote_average.toFixed(1)} ⭐`} 
                size="small" 
                sx={{ backgroundColor: 'secondary.container', color: 'secondary.onContainer', fontWeight: 700, borderRadius: '6px' }} 
              />
            )}
            {series.genres?.map((g) => (
              <Chip 
                key={g.id} 
                label={g.name} 
                size="small" 
                sx={{ backgroundColor: 'background.paper', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px' }} 
              />
            ))}
          </Stack>

          <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7, mb: 4, maxWidth: '800px', fontSize: '0.95rem' }}>
            {series.overview}
          </Typography>

          {/* Cast list */}
          {series.credits?.cast && series.credits.cast.length > 0 && (
            <Box sx={{ mb: 6 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, letterSpacing: "0.2px" }}>
                Cast & Crew
              </Typography>
              <Box sx={{
                display: 'flex',
                gap: 2.5,
                overflowX: 'auto',
                pb: 1.5,
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' }
              }}>
                {series.credits.cast.slice(0, 12).map((cast) => {
                  const photo = cast.profile_path
                    ? `https://image.tmdb.org/t/p/w185${cast.profile_path}`
                    : "https://via.placeholder.com/185x278?text=No+Photo";
                  return (
                    <Box key={cast.id} sx={{ flex: '0 0 auto', width: 90, textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: 72,
                          height: 72,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          mx: 'auto',
                          mb: 1,
                          border: '2px solid rgba(255, 255, 255, 0.08)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                        }}
                      >
                        <img
                          src={photo}
                          alt={cast.name}
                          loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>
                      <Typography 
                        variant="caption" 
                        noWrap
                        sx={{ 
                          fontWeight: 700, 
                          display: 'block', 
                          color: 'text.primary', 
                          lineHeight: 1.2,
                          px: 0.5
                        }}
                      >
                        {cast.name}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        noWrap
                        sx={{ 
                          color: 'text.secondary', 
                          display: 'block', 
                          fontSize: '0.65rem', 
                          lineHeight: 1.1,
                          px: 0.5
                        }}
                      >
                        {cast.character}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Season Selector */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 800, letterSpacing: "0.2px" }}>
            Seasons
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: 1.2, 
            overflowX: 'auto', 
            pb: 2, 
            mb: 4,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' }
          }}>
            {series.seasons?.filter(season => season.season_number > 0).map((seasonObj) => (
              <Link
                key={seasonObj.id}
                href={`/series/${id}?s=${seasonObj.season_number}&e=1`}
                style={{ textDecoration: 'none' }}
              >
                <Button
                  variant={s === seasonObj.season_number ? "contained" : "outlined"}
                  size="small"
                  sx={{
                    minWidth: 'fit-content',
                    borderRadius: '20px',
                    px: 2.5,
                    py: 0.8,
                    borderColor: s === seasonObj.season_number ? 'primary.main' : 'rgba(255, 255, 255, 0.15)',
                    color: s === seasonObj.season_number ? 'background.default' : 'text.primary',
                    textTransform: 'none',
                    fontWeight: 700,
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: s === seasonObj.season_number ? 'primary.main' : 'rgba(255, 255, 255, 0.04)'
                    }
                  }}
                >
                  {seasonObj.name}
                </Button>
              </Link>
            ))}
          </Box>

          {/* Episode Selector */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 800, letterSpacing: "0.2px" }}>
            Episodes ({episodes.length})
          </Typography>
          <Grid container spacing={2} sx={{ mb: 6 }}>
            {episodes.map((ep) => (
              <Grid key={ep.id} size={{ xs: 12, sm: 6 }}>
                <Link
                  href={`/series/${id}?s=${s}&e=${ep.episode_number}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Box sx={{
                    p: 2,
                    borderRadius: '16px',
                    backgroundColor: e === ep.episode_number ? 'rgba(208, 188, 255, 0.1)' : 'background.paper',
                    border: '1px solid',
                    borderColor: e === ep.episode_number ? 'primary.main' : 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: e === ep.episode_number ? 'rgba(208, 188, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      borderColor: e === ep.episode_number ? 'primary.main' : 'rgba(255, 255, 255, 0.15)',
                      transform: 'translateY(-2px)'
                    }
                  }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: 900, 
                        minWidth: 28, 
                        color: e === ep.episode_number ? 'primary.main' : 'text.secondary',
                        textAlign: 'center'
                      }}
                    >
                      {ep.episode_number}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      noWrap 
                      sx={{ 
                        flexGrow: 1, 
                        color: e === ep.episode_number ? 'primary.main' : 'text.primary',
                        fontWeight: e === ep.episode_number ? 700 : 500
                      }}
                    >
                      {ep.name}
                    </Typography>
                  </Box>
                </Link>
              </Grid>
            ))}
            {episodes.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                No episodes found for this season.
              </Typography>
            )}
          </Grid>

          {/* TV Recommendations Row */}
          {recommendations.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <MediaRow title="Recommendations" items={recommendations} type="tv" />
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}
