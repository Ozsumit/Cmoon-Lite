import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import LitePlayer from '@/components/lite/LitePlayer';
import MediaRow from '@/components/lite/MediaRow';
import { MOVIE_SERVERS } from '@/lib/config';
import { getVideoSources } from '@/lib/video-sources';

async function getMovie(id) {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&append_to_response=credits`;
  const res = await fetch(url, { next: { revalidate: 1800 } });
  if (!res.ok) return null;
  return res.json();
}

async function getRecommendations(id) {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey || apiKey === "dummy") return [];
  const url = `https://api.themoviedb.org/3/movie/${id}/recommendations?api_key=${apiKey}&language=en-US&page=1`;
  try {
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch (e) {
    return [];
  }
}

export default async function LiteMoviePage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const [movie, recommendations, dbServers] = await Promise.all([
    getMovie(id),
    getRecommendations(id),
    getVideoSources("movie")
  ]);

  if (!movie) return <Container sx={{ py: 8, textAlign: 'center' }}><Typography>Movie not found</Typography></Container>;

  const servers = dbServers && dbServers.length > 0 ? dbServers : MOVIE_SERVERS;

  // Format runtime to hours and minutes
  const formatRuntime = (mins) => {
    if (!mins) return "";
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return hrs > 0 ? `${hrs}h ${remainingMins}m` : `${remainingMins}m`;
  };

  return (
    <Box sx={{ position: "relative", minHeight: "100vh" }}>
      {/* Immersive cinematic background glow */}
      {movie.backdrop_path && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "450px",
            backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
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

      {/* Video Player Section (Breaks constraints for Theater Mode) */}
      <Box sx={{ width: "100%", mx: "auto", px: { xs: 0, md: 4 }, py: { xs: 0, md: 3 } }}>
        <LitePlayer 
          id={id} 
          servers={servers} 
          type="movie" 
          title={movie.title}
          posterPath={movie.poster_path}
          backdropPath={movie.backdrop_path}
        />
      </Box>

      {/* Details Container */}
      <Container sx={{ pb: 6, px: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ mt: 1 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 900, mb: 1.5, letterSpacing: "-0.5px" }}>
            {movie.title}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
            <Chip 
              label={movie.release_date?.slice(0, 4) || "N/A"} 
              size="small" 
              variant="outlined" 
              sx={{ borderColor: 'rgba(255,255,255,0.15)', borderRadius: '6px' }}
            />
            {movie.vote_average > 0 && (
              <Chip 
                label={`${movie.vote_average.toFixed(1)} ⭐`} 
                size="small" 
                sx={{ backgroundColor: 'secondary.container', color: 'secondary.onContainer', fontWeight: 700, borderRadius: '6px' }} 
              />
            )}
            {movie.runtime > 0 && (
              <Chip 
                label={formatRuntime(movie.runtime)} 
                size="small" 
                variant="outlined" 
                sx={{ borderColor: 'rgba(255,255,255,0.15)', borderRadius: '6px' }}
              />
            )}
            {movie.genres?.map((g) => (
              <Chip 
                key={g.id} 
                label={g.name} 
                size="small" 
                sx={{ backgroundColor: 'background.paper', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px' }} 
              />
            ))}
          </Stack>

          {movie.tagline && (
            <Typography variant="subtitle1" sx={{ fontStyle: 'italic', color: 'primary.main', mb: 2, fontWeight: 500 }}>
              "{movie.tagline}"
            </Typography>
          )}

          <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7, mb: 4, maxWidth: '800px', fontSize: '0.95rem' }}>
            {movie.overview}
          </Typography>
        </Box>

        {/* Cast list */}
        {movie.credits?.cast && movie.credits.cast.length > 0 && (
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
              {movie.credits.cast.slice(0, 12).map((cast) => {
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

        {/* Similar/Recommended Content Row */}
        {recommendations.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <MediaRow title="Recommendations" items={recommendations} type="movie" />
          </Box>
        )}
      </Container>
    </Box>
  );
}
