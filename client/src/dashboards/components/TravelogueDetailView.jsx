import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Stack, Avatar, Rating, Chip, Divider, TextField, CircularProgress, Card, CardContent, Grid, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Alert
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ShareIcon from '@mui/icons-material/Share';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GroupIcon from '@mui/icons-material/Group';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { motion } from 'framer-motion';
import api from '../../api';
import { buildImageUrl } from '../../utils/imageHelper';

export default function TravelogueDetailView({ travelogueId, travelogue: initialTravelogue, onClose, open }) {
  const [travelogue, setTravelogue] = useState(initialTravelogue || null);
  const [loading, setLoading] = useState(!initialTravelogue);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [commentingLoading, setCommentingLoading] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [error, setError] = useState('');
  const userId = JSON.parse(localStorage.getItem('user') || '{}')._id;

  useEffect(() => {
    // Only fetch if we have an ID and no initial travelogue data
    if (travelogueId && !initialTravelogue) {
      fetchTravelogue();
    }
  }, [travelogueId, initialTravelogue]);

  const fetchTravelogue = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/travelogue/${travelogueId}`);
      setTravelogue(response.data);
    } catch (err) {
      console.error('Error fetching travelogue:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      setError('Failed to load travelogue: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const id = travelogue?._id || travelogueId;
      if (!id) return;
      const response = await api.post(`/travelogue/${id}/like`);
      setLiked(response.data.liked);
      setTravelogue(prev => ({
        ...prev,
        likes: response.data.liked
          ? [...(prev.likes || []), { userId }]
          : (prev.likes || []).filter(l => l.userId !== userId)
      }));
    } catch (err) {
      console.error('Error liking:', err);
    }
  };

  const handleSave = async () => {
    try {
      const id = travelogue?._id || travelogueId;
      if (!id) return;
      const response = await api.post(`/travelogue/${id}/save`);
      setSaved(response.data.saved);
    } catch (err) {
      console.error('Error saving:', err);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      setCommentingLoading(true);
      const id = travelogue?._id || travelogueId;
      if (!id) return;
      const response = await api.post(`/travelogue/${id}/comment`, {
        text: commentText,
        userName: JSON.parse(localStorage.getItem('user') || '{}').name,
        userAvatar: JSON.parse(localStorage.getItem('user') || '{}').avatar
      });

      setTravelogue(prev => ({
        ...prev,
        comments: [...(prev.comments || []), response.data.comment]
      }));
      setCommentText('');
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment');
    } finally {
      setCommentingLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const id = travelogue?._id || travelogueId;
      if (!id) return;
      await api.delete(`/travelogue/${id}/comment/${commentId}`);
      setTravelogue(prev => ({
        ...prev,
        comments: prev.comments.filter(c => c._id !== commentId)
      }));
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <Dialog open={open !== false} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  if (!travelogue) {
    return (
      <Dialog open={open !== false} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogContent>
          <Alert severity="error">Failed to load travelogue</Alert>
        </DialogContent>
      </Dialog>
    );
  }

  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Reset image error when index changes
    setImageError(false);
  }, [imageIndex]);

  const imageUrl = React.useMemo(() => {
    if (!travelogue?.images || !travelogue.images[imageIndex]) {
      return '/no-image.png';
    }

    const imgPath = travelogue.images[imageIndex];
    console.log('Building image URL for:', imgPath);
    
    const url = buildImageUrl(imgPath);
    console.log('Final image URL:', url);
    return url;
  }, [travelogue?.images, imageIndex]);

  return (
    <Dialog
      open={open !== false}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          maxHeight: '90vh',
          overflow: 'auto'
        }
      }}
    >
      <DialogTitle sx={{ p: 0, position: 'relative' }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 12,
            top: 12,
            zIndex: 10,
            bgcolor: 'rgba(255,255,255,0.95)',
            color: '#1a1a1a',
            '&:hover': { bgcolor: '#fff' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: '#ffffff' }}>
        {/* Premium Image Carousel */}
        <Box 
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          sx={{ 
            position: 'relative', 
            width: '100%',
            height: { xs: 350, sm: 450, md: 600 }, 
            bgcolor: '#f0f0f0', 
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Loading State */}
          {!imageUrl && (
            <CircularProgress sx={{ color: '#4F8A8B' }} />
          )}

          {/* Image with proper error handling */}
          <img
            key={`img-${imageIndex}`}
            src={imageUrl}
            alt={travelogue.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: imageError ? 'none' : 'block'
            }}
            onError={(e) => {
              console.error('Image load error:', imageUrl, e);
              setImageError(true);
              e.target.style.display = 'none';
            }}
            onLoad={(e) => {
              console.log('Image loaded successfully:', imageUrl);
              setImageError(false);
            }}
          />

          {/* Fallback Image */}
          {imageError && (
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#e5e7eb',
                color: '#6b7280',
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              <Stack alignItems="center" spacing={1}>
                <Box sx={{ fontSize: '48px' }}>🖼️</Box>
                <Typography>Image not available</Typography>
                <Typography variant="caption" color="#9ca3af">
                  {imageUrl}
                </Typography>
              </Stack>
            </Box>
          )}

          {/* Premium Gradient Overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.1) 100%)',
              pointerEvents: 'none'
            }}
          />

          {/* Close Button - Premium Style */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconButton
              onClick={onClose}
              sx={{
                position: 'absolute',
                right: 20,
                top: 20,
                zIndex: 10,
                bgcolor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                width: 48,
                height: 48,
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.25)',
                  borderColor: 'rgba(255,255,255,0.4)'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </motion.div>

          {/* Navigation Buttons - Premium Style */}
          {travelogue.images && travelogue.images.length > 1 && (
            <>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 5
                }}
              >
                <IconButton
                  onClick={() => setImageIndex(prev => prev === 0 ? travelogue.images.length - 1 : prev - 1)}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    '&:hover': { 
                      bgcolor: 'rgba(79,138,139,0.8)',
                      borderColor: 'rgba(79,138,139,1)'
                    }
                  }}
                >
                  <ChevronLeftIcon fontSize="large" />
                </IconButton>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 5
                }}
              >
                <IconButton
                  onClick={() => setImageIndex(prev => prev === travelogue.images.length - 1 ? 0 : prev + 1)}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    '&:hover': { 
                      bgcolor: 'rgba(79,138,139,0.8)',
                      borderColor: 'rgba(79,138,139,1)'
                    }
                  }}
                >
                  <ChevronRightIcon fontSize="large" />
                </IconButton>
              </motion.div>

              {/* Premium Image Indicators */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 24,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: 1.5,
                  zIndex: 5,
                  bgcolor: 'rgba(0,0,0,0.3)',
                  backdropFilter: 'blur(10px)',
                  px: 2.5,
                  py: 1.5,
                  borderRadius: '50px',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                {travelogue.images.map((_, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.3 }}
                    whileTap={{ scale: 0.8 }}
                  >
                    <Box
                      onClick={() => setImageIndex(idx)}
                      sx={{
                        width: idx === imageIndex ? 28 : 8,
                        height: 8,
                        borderRadius: '50px',
                        background: idx === imageIndex 
                          ? 'linear-gradient(135deg, #4F8A8B 0%, #6BA8AC 100%)'
                          : 'rgba(255,255,255,0.3)',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          background: idx === imageIndex 
                            ? 'linear-gradient(135deg, #4F8A8B 0%, #6BA8AC 100%)'
                            : 'rgba(255,255,255,0.5)'
                        }
                      }}
                    />
                  </motion.div>
                ))}
              </Box>

              {/* Counter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={imageIndex}
              >
                <Typography
                  sx={{
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    bgcolor: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(10px)',
                    color: '#fff',
                    px: 2,
                    py: 0.8,
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  {imageIndex + 1} / {travelogue.images.length}
                </Typography>
              </motion.div>
            </>
          )}
        </Box>

        {/* Content */}
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          {/* Header */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={3} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
            <Box>
              <Typography variant="h4" fontWeight={800} color="#1a1a1a" mb={1} sx={{ letterSpacing: '0.5px' }}>
                {travelogue.title}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <LocationOnIcon sx={{ fontSize: 20, color: '#4F8A8B' }} />
                  <Typography variant="body1" fontWeight={600} color="#6B7280">
                    {travelogue.location || travelogue.destination}
                  </Typography>
                </Stack>
                {travelogue.rating > 0 && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Rating value={travelogue.rating} readOnly size="small" />
                    <Typography variant="body2" fontWeight={700} color="#4F8A8B">
                      {travelogue.rating.toFixed(1)}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Box>

            {/* Action Buttons */}
            <Stack direction="row" spacing={1}>
              <Button
                variant={liked ? 'contained' : 'outlined'}
                startIcon={liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                onClick={handleLike}
                sx={{
                  borderRadius: '10px',
                  color: liked ? '#fff' : '#ef4444',
                  bgcolor: liked ? '#ef4444' : 'transparent',
                  borderColor: '#ef4444'
                }}
                size="small"
              >
                {travelogue.likes?.length || 0}
              </Button>
              <Button
                variant={saved ? 'contained' : 'outlined'}
                startIcon={saved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                onClick={handleSave}
                sx={{
                  borderRadius: '10px',
                  color: saved ? '#fff' : '#F9ED69',
                  bgcolor: saved ? '#F9ED69' : 'transparent',
                  borderColor: '#F9ED69'
                }}
                size="small"
              >
                Save
              </Button>
              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={() => setShareMenuOpen(true)}
                sx={{
                  borderRadius: '10px',
                  color: '#4F8A8B',
                  borderColor: '#4F8A8B'
                }}
                size="small"
              >
                Share
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* Author Info */}
          <Stack direction="row" spacing={2} alignItems="center" mb={4} sx={{ p: 2, bgcolor: 'rgba(79,138,139,0.03)', borderRadius: '12px' }}>
            <Avatar
              src={
                travelogue.userId?.avatar?.startsWith('http')
                  ? travelogue.userId.avatar
                  : travelogue.userId?.avatar
                    ? `http://localhost:3001${travelogue.userId.avatar}`
                    : '/default-avatar.png'
              }
              sx={{ width: 56, height: 56 }}
            />
            <Box flex={1}>
              <Typography variant="h6" fontWeight={700} color="#1a1a1a">
                {travelogue.userId?.name}
              </Typography>
              <Typography variant="body2" color="#6B7280">
                Published on {formatDate(travelogue.createdAt)}
              </Typography>
            </Box>
          </Stack>

          {/* Trip Statistics */}
          <Grid container spacing={2} mb={4}>
            {travelogue.duration && (
              <Grid item xs={6} sm={3}>
                <Card elevation={0} sx={{ p: 2, textAlign: 'center', border: '1px solid rgba(79,138,139,0.1)', borderRadius: '12px' }}>
                  <CalendarTodayIcon sx={{ fontSize: 28, color: '#4F8A8B', mb: 1 }} />
                  <Typography variant="body2" fontWeight={700} color="#6B7280">
                    {travelogue.duration} Days
                  </Typography>
                </Card>
              </Grid>
            )}
            {travelogue.travelersCount && (
              <Grid item xs={6} sm={3}>
                <Card elevation={0} sx={{ p: 2, textAlign: 'center', border: '1px solid rgba(79,138,139,0.1)', borderRadius: '12px' }}>
                  <GroupIcon sx={{ fontSize: 28, color: '#4F8A8B', mb: 1 }} />
                  <Typography variant="body2" fontWeight={700} color="#6B7280">
                    {travelogue.travelersCount} Travelers
                  </Typography>
                </Card>
              </Grid>
            )}
            {travelogue.estimatedCost && (
              <Grid item xs={6} sm={3}>
                <Card elevation={0} sx={{ p: 2, textAlign: 'center', border: '1px solid rgba(79,138,139,0.1)', borderRadius: '12px' }}>
                  <MonetizationOnIcon sx={{ fontSize: 28, color: '#4F8A8B', mb: 1 }} />
                  <Typography variant="body2" fontWeight={700} color="#6B7280">
                    ${travelogue.estimatedCost}
                  </Typography>
                </Card>
              </Grid>
            )}
            {travelogue.views && (
              <Grid item xs={6} sm={3}>
                <Card elevation={0} sx={{ p: 2, textAlign: 'center', border: '1px solid rgba(79,138,139,0.1)', borderRadius: '12px' }}>
                  <Typography variant="h6" fontWeight={700} color="#4F8A8B" mb={0.5}>
                    {travelogue.views}
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="#6B7280">
                    Views
                  </Typography>
                </Card>
              </Grid>
            )}
          </Grid>

          {/* Tags */}
          {travelogue.tags && travelogue.tags.length > 0 && (
            <Box mb={4}>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {travelogue.tags.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    sx={{
                      fontWeight: 600,
                      bgcolor: 'rgba(79,138,139,0.1)',
                      color: '#4F8A8B'
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* Main Content */}
          <Typography
            variant="body1"
            color="#4a5568"
            sx={{
              lineHeight: 1.8,
              mb: 4,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {travelogue.description}
          </Typography>

          {/* Highlights */}
          {travelogue.highlights && travelogue.highlights.length > 0 && (
            <Box mb={4}>
              <Typography variant="h6" fontWeight={700} color="#1a1a1a" mb={2}>
                Key Highlights
              </Typography>
              <Stack spacing={1}>
                {travelogue.highlights.map((highlight, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4F8A8B' }} />
                    <Typography color="#6B7280">{highlight}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          <Divider sx={{ my: 4 }} />

          {/* Comments Section */}
          <Typography variant="h6" fontWeight={700} color="#1a1a1a" mb={3}>
            Comments ({travelogue.comments?.length || 0})
          </Typography>

          {/* Add Comment */}
          <Card elevation={0} sx={{ p: 2.5, mb: 3, border: '1px solid rgba(79,138,139,0.1)', borderRadius: '12px' }}>
            <Stack spacing={2}>
              <TextField
                placeholder="Share your thoughts..."
                multiline
                rows={3}
                fullWidth
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={commentingLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px'
                  }
                }}
              />
              <Button
                variant="contained"
                endIcon={<SendIcon />}
                disabled={!commentText.trim() || commentingLoading}
                onClick={handleAddComment}
                sx={{
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #4F8A8B 0%, #6BA8AC 100%)',
                  alignSelf: 'flex-end'
                }}
              >
                {commentingLoading ? 'Posting...' : 'Post Comment'}
              </Button>
            </Stack>
          </Card>

          {/* Comments List */}
          <Stack spacing={2}>
            {travelogue.comments && travelogue.comments.map(comment => (
              <Card key={comment._id} elevation={0} sx={{ p: 2, border: '1px solid rgba(79,138,139,0.1)', borderRadius: '12px' }}>
                <Stack direction="row" spacing={2} mb={2}>
                  <Avatar src={comment.userId?.avatar} sx={{ width: 40, height: 40 }} />
                  <Box flex={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" fontWeight={700} color="#1a1a1a">
                        {comment.userName || comment.userId?.name}
                      </Typography>
                      {comment.userId === userId && (
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteComment(comment._id)}
                          sx={{ color: '#ef4444' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                    <Typography variant="caption" color="#6B7280">
                      {formatDate(comment.createdAt)}
                    </Typography>
                  </Box>
                </Stack>
                <Typography color="#4a5568" variant="body2" sx={{ ml: 7 }}>
                  {comment.text}
                </Typography>
              </Card>
            ))}
            {(!travelogue.comments || travelogue.comments.length === 0) && (
              <Typography color="#6B7280" textAlign="center" variant="body2">
                No comments yet. Be the first to share!
              </Typography>
            )}
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
}