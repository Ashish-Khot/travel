
import React, { useState } from 'react';
import {
  Box, Button, TextField, Typography, Rating, Chip, Stack, Paper, Alert, Snackbar, Grid, IconButton, Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import api from '../../api';

export default function CreateTravelogue() {
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');
  const [media, setMedia] = useState([]); // files
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleMediaChange = (e) => {
    setMedia([...e.target.files]);
  };

  const handleRemoveMedia = (idx) => {
    setMedia(media.filter((_, i) => i !== idx));
  };

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  const handleDeleteTag = (tagToDelete) => {
    setTags(tags.filter((tag) => tag !== tagToDelete));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('destination', destination);
      formData.append('description', description);
      formData.append('rating', rating);
      tags.forEach((tag) => formData.append('tags', tag));
      for (let file of media) {
        formData.append('media', file);
      }
      await api.post('/travelogue/tourist', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
      setTitle('');
      setDestination('');
      setDescription('');
      setMedia([]);
      setRating(0);
      setTags([]);
      setTagInput('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit travelogue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" mb={2} fontWeight={700} textAlign="center" color="primary.main">Create Travelogue</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          label="Travel Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Story / Experience Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          required
          margin="normal"
          multiline
          minRows={4}
        />
        <Box mt={2} mb={2}>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>Photos & Videos</Typography>
          <Button
            variant="contained"
            component="label"
            color="secondary"
            startIcon={<PhotoCamera />}
            sx={{ borderRadius: 3, fontWeight: 600, boxShadow: 2 }}
          >
            Select Files
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              hidden
              onChange={handleMediaChange}
            />
          </Button>
          {media.length > 0 && (
            <Grid container spacing={2} mt={1}>
              {media.map((file, idx) => {
                const isImage = file.type.startsWith('image/');
                const isVideo = file.type.startsWith('video/');
                const url = URL.createObjectURL(file);
                return (
                  <Grid item xs={6} sm={4} md={3} key={idx}>
                    <Paper elevation={2} sx={{ p: 1, position: 'relative', borderRadius: 2 }}>
                      {isImage && (
                        <img src={url} alt={file.name} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }} />
                      )}
                      {isVideo && (
                        <video src={url} controls style={{ width: '100%', height: 120, borderRadius: 8 }} />
                      )}
                      <Tooltip title="Remove">
                        <IconButton size="small" sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'background.paper', zIndex: 2 }} onClick={() => handleRemoveMedia(idx)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Typography variant="caption" display="block" mt={0.5} noWrap>{file.name}</Typography>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
        <Box mb={2}>
          <Typography variant="subtitle1">Rating</Typography>
          <Rating
            value={rating}
            onChange={(_, newValue) => setRating(newValue)}
            size="large"
          />
        </Box>
        <Box mb={2}>
          <Typography variant="subtitle1">Tags</Typography>
          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
              placeholder="Add tag"
            />
            <Button onClick={handleAddTag} disabled={!tagInput}>Add</Button>
          </Stack>
          <Stack direction="row" spacing={1} mt={1}>
            {tags.map((tag) => (
              <Chip key={tag} label={tag} onDelete={() => handleDeleteTag(tag)} />
            ))}
          </Stack>
        </Box>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          sx={{ mt: 3, py: 1.5, fontWeight: 700, fontSize: '1.1rem', borderRadius: 3, boxShadow: 2 }}
        >
          {loading ? 'Submitting...' : 'Submit Travelogue'}
        </Button>
      </Box>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="error" onClose={() => setError('')} sx={{ width: '100%' }}>{error}</Alert>
      </Snackbar>
      <Snackbar open={success} autoHideDuration={4000} onClose={() => setSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSuccess(false)} sx={{ width: '100%' }}>Travelogue submitted successfully!</Alert>
      </Snackbar>
    </Paper>
  );
}
