
import React, { useState } from "react";
import { Box, Typography, Paper, List, ListItem, ListItemAvatar, Avatar, ListItemText, Rating, TextField, Button } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";

const initialReviews = [
  { user: "Tourist 1", rating: 5, text: "Great stay! Very clean and comfortable.", time: "1 day ago", response: "" },
  { user: "Tourist 2", rating: 4, text: "Good location and friendly staff.", time: "2 days ago", response: "" },
  { user: "Tourist 3", rating: 4.5, text: "Nice amenities, will visit again.", time: "3 days ago", response: "" },
];

export default function HotelReviews() {
  const [reviews, setReviews] = useState(initialReviews);
  const [reply, setReply] = useState("");
  const [replyIdx, setReplyIdx] = useState(-1);

  const handleReply = idx => {
    setReplyIdx(idx);
    setReply(reviews[idx].response || "");
  };
  const handleSend = () => {
    if (replyIdx >= 0) {
      const updated = [...reviews];
      updated[replyIdx].response = reply;
      setReviews(updated);
      setReplyIdx(-1);
      setReply("");
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={1}>Reviews</Typography>
      <Typography color="text.secondary" mb={3}>See what tourists are saying about your hotel</Typography>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3, maxWidth: 700 }}>
        <List>
          {reviews.map((review, idx) => (
            <ListItem key={idx} alignItems="flex-start" sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <Box display="flex" alignItems="center">
                <ListItemAvatar>
                  <Avatar><StarIcon /></Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<>
                    <Typography fontWeight={600}>{review.user}</Typography>
                    <Rating value={review.rating} precision={0.5} readOnly size="small" sx={{ ml: 1 }} />
                  </>}
                  secondary={<>
                    <Typography color="text.primary">{review.text}</Typography>
                    <Typography variant="caption" color="text.secondary">{review.time}</Typography>
                  </>}
                />
              </Box>
              {review.response ? (
                <Box ml={7} mt={1} mb={1}>
                  <Typography variant="body2" color="success.main">Your response: {review.response}</Typography>
                </Box>
              ) : replyIdx === idx ? (
                <Box ml={7} mt={1} mb={1} display="flex" gap={1}>
                  <TextField size="small" label="Write a response" value={reply} onChange={e => setReply(e.target.value)} />
                  <Button variant="contained" onClick={handleSend}>Send</Button>
                </Box>
              ) : (
                <Box ml={7} mt={1} mb={1}>
                  <Button size="small" variant="outlined" onClick={() => handleReply(idx)}>Reply</Button>
                </Box>
              )}
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}
