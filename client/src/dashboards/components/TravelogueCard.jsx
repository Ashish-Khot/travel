import React, { useState } from 'react';
import {
  Card, Box, CardMedia, CardContent, CardActions, Typography, IconButton, Chip, Stack, Avatar, Rating, Tooltip, Menu, MenuItem
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ShareIcon from '@mui/icons-material/Share';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupIcon from '@mui/icons-material/Group';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { motion } from 'framer-motion';
import api from '../../api';
import { buildImageUrl } from '../../utils/imageHelper';

export default function TravelogueCard({ travelogue, onViewDetails, onRefresh }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(travelogue.likes?.length || 0);
  const [saveCount, setSaveCount] = useState(travelogue.saves?.length || 0);
  const [imageIndex, setImageIndex] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const userId = JSON.parse(localStorage.getItem('user') || '{}')._id;

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      const response = await api.post(`/travelogue/${travelogue._id}/like`);
      setLiked(response.data.liked);
      setLikeCount(response.data.likeCount);
    } catch (err) {
      console.error('Error liking travelogue:', err);
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    try {
      const response = await api.post(`/travelogue/${travelogue._id}/save`);
      setSaved(response.data.saved);
      setSaveCount(response.data.saveCount);
    } catch (err) {
      console.error('Error saving travelogue:', err);
    }
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setImageIndex((prev) => (prev === 0 ? travelogue.images?.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setImageIndex((prev) => (prev === travelogue.images?.length - 1 ? 0 : prev + 1));
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleShare = (platform) => {
    setAnchorEl(null);
    const text = `Check out "${travelogue.title}" - ${travelogue.destination}!`;
    const url = window.location.origin; // You can add a specific travelogue URL here
    
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)} ${url}`);
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`);
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`);
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(`${text} ${url}`);
      alert('Link copied to clipboard!');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const imageUrl = React.useMemo(() => {
    if (!travelogue?.images || !travelogue.images[imageIndex]) {
      return '/no-image.png';
    }
    return buildImageUrl(travelogue.images[imageIndex]);
  }, [travelogue?.images, imageIndex]);

  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: '0 20px 60px rgba(79,138,139,0.2)' }}
      transition={{ type: 'spring', stiffness: 300 }}
      onClick={() => onViewDetails?.(travelogue._id)}
      style={{ cursor: 'pointer' }}
    >
      <Card
        elevation={0}
        sx={{
          borderRadius: '16px',
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(79,138,139,0.1)',
          boxShadow: '0 8px 24px rgba(79,138,139,0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          bgcolor: '#ffffff'
        }}
      >
        {/* Image Section with Carousel */}
        <Box sx={{ position: 'relative', paddingBottom: '66.67%', overflow: 'hidden', bgcolor: '#f0f0f0' }}>
          <Box
            component="img"
            src={imageUrl}
            alt={travelogue.title}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease'
            }}
            onError={(e) => {
              e.target.src = '/no-image.png';
            }}
          />

          {/* Image Navigation */}
          {travelogue.images && travelogue.images.length > 1 && (
            <>
              <IconButton
                size="small"
                onClick={handlePrevImage}
                sx={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255,255,255,0.9)',
                  color: '#4F8A8B',
                  zIndex: 2,
                  '&:hover': { bgcolor: '#fff' }
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleNextImage}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255,255,255,0.9)',
                  color: '#4F8A8B',
                  zIndex: 2,
                  '&:hover': { bgcolor: '#fff' }
                }}
              >
                <ChevronRightIcon />
              </IconButton>

              {/* Image Dots */}
              <Stack
                direction="row"
                spacing={0.5}
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 2
                }}
              >
                {travelogue.images.map((_, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: idx === imageIndex ? '#fff' : 'rgba(255,255,255,0.5)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageIndex(idx);
                    }}
                  />
                ))}
              </Stack>
            </>
          )}

          {/* Rating Badge */}
          {travelogue.rating > 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                bgcolor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(4px)',
                borderRadius: '20px',
                px: 1.2,
                py: 0.6,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                zIndex: 2
              }}
            >
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#4F8A8B' }}>
                {travelogue.rating.toFixed(1)}
              </span>
              <span style={{ color: '#F9ED69', fontSize: '0.9rem' }}>★</span>
            </Box>
          )}

          {/* Status Chip */}
          {travelogue.status !== 'approved' && (
            <Chip
              label={travelogue.status.toUpperCase()}
              size="small"
              sx={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                zIndex: 2,
                bgcolor: travelogue.status === 'pending' ? 'rgba(251, 191, 36, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.7rem'
              }}
            />
          )}
        </Box>

        {/* Content Section */}
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          {/* Author Info */}
          <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
            <Avatar
              src={
                travelogue.userId?.avatar?.startsWith('http')
                  ? travelogue.userId.avatar
                  : travelogue.userId?.avatar
                    ? `http://localhost:3001${travelogue.userId.avatar}`
                    : '/default-avatar.png'
              }
              sx={{ width: 32, height: 32 }}
            />
            <Box flex={1}>
              <Typography
                variant="body2"
                fontWeight={600}
                color="#1a1a1a"
                noWrap
              >
                {travelogue.userId?.name || 'Anonymous'}
              </Typography>
              <Typography variant="caption" color="#6B7280">
                {formatDate(travelogue.createdAt)}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={handleMenuClick}
              sx={{ color: '#6B7280' }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Stack>

          {/* Title */}
          <Typography
            variant="h6"
            fontWeight={700}
            color="#1a1a1a"
            mb={1}
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {travelogue.title}
          </Typography>

          {/* Location & Duration */}
          <Stack direction="row" spacing={2} mb={2} flexWrap="wrap">
            {travelogue.location && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <LocationOnIcon sx={{ fontSize: 16, color: '#4F8A8B' }} />
                <Typography variant="caption" color="#6B7280" fontWeight={600}>
                  {travelogue.location}
                </Typography>
              </Stack>
            )}
            {travelogue.duration && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <CalendarTodayIcon sx={{ fontSize: 16, color: '#4F8A8B' }} />
                <Typography variant="caption" color="#6B7280" fontWeight={600}>
                  {travelogue.duration} days
                </Typography>
              </Stack>
            )}
          </Stack>

          {/* Description */}
          <Typography
            variant="body2"
            color="#6B7280"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 2,
              lineHeight: 1.5
            }}
          >
            {travelogue.description}
          </Typography>

          {/* Tags */}
          {travelogue.tags && travelogue.tags.length > 0 && (
            <Stack direction="row" spacing={0.8} flexWrap="wrap" gap={0.8}>
              {travelogue.tags.slice(0, 3).map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  sx={{
                    fontSize: '0.75rem',
                    height: 24,
                    fontWeight: 600,
                    bgcolor: 'rgba(79,138,139,0.08)',
                    color: '#4F8A8B'
                  }}
                />
              ))}
            </Stack>
          )}
        </CardContent>

        {/* Stats Section */}
        <Box sx={{ px: 2, py: 1.5, bgcolor: 'rgba(79,138,139,0.02)', borderTop: '1px solid rgba(79,138,139,0.1)' }}>
          <Stack direction="row" spacing={2} justifyContent="space-around" alignItems="center">
            <Stack alignItems="center">
              <TrendingUpIcon sx={{ fontSize: 18, color: '#4F8A8B' }} />
              <Typography variant="caption" fontWeight={700} color="#6B7280" fontSize="0.75rem">
                {travelogue.views || 0} views
              </Typography>
            </Stack>
            <Stack alignItems="center">
              <FavoriteIcon sx={{ fontSize: 18, color: '#ef4444' }} />
              <Typography variant="caption" fontWeight={700} color="#6B7280" fontSize="0.75rem">
                {likeCount} likes
              </Typography>
            </Stack>
            <Stack alignItems="center">
              <BookmarkIcon sx={{ fontSize: 18, color: '#F9ED69' }} />
              <Typography variant="caption" fontWeight={700} color="#6B7280" fontSize="0.75rem">
                {saveCount} saved
              </Typography>
            </Stack>
          </Stack>
        </Box>

        {/* Actions Section */}
        <CardActions sx={{ p: 1.5, justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={0.5}>
            <Tooltip title={liked ? 'Unlike' : 'Like'}>
              <IconButton
                size="small"
                onClick={handleLike}
                sx={{
                  color: liked ? '#ef4444' : '#6B7280',
                  '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' }
                }}
              >
                {liked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title={saved ? 'Unsave' : 'Save'}>
              <IconButton
                size="small"
                onClick={handleSave}
                sx={{
                  color: saved ? '#F9ED69' : '#6B7280',
                  '&:hover': { bgcolor: 'rgba(249, 237, 105, 0.1)' }
                }}
              >
                {saved ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Stack>
          <Tooltip title="Share">
            <IconButton
              size="small"
              onClick={handleMenuClick}
              sx={{
                color: '#6B7280',
                '&:hover': { bgcolor: 'rgba(79, 138, 139, 0.1)' }
              }}
            >
              <ShareIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </CardActions>

        {/* Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            sx: { borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }
          }}
        >
          <MenuItem onClick={() => handleShare('whatsapp')}>Share on WhatsApp</MenuItem>
          <MenuItem onClick={() => handleShare('facebook')}>Share on Facebook</MenuItem>
          <MenuItem onClick={() => handleShare('twitter')}>Share on Twitter</MenuItem>
          <MenuItem onClick={() => handleShare('copy')}>Copy Link</MenuItem>
        </Menu>
      </Card>
    </motion.div>
  );
}