
import React, { useState } from "react";
import { Box, Typography, Paper, List, ListItem, ListItemAvatar, Avatar, ListItemText, Badge, TextField, Button } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";

const initialMessages = [
  { from: "Tourist 1", text: "Hello, is breakfast included?", time: "2 min ago" },
  { from: "Tourist 2", text: "Can I check in early?", time: "10 min ago" },
  { from: "Tourist 3", text: "Do you have parking?", time: "1 hr ago" },
];

export default function HotelChat() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      setMessages([{ from: "You", text: input, time: "now" }, ...messages]);
      setInput("");
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={1}>Chat</Typography>
      <Typography color="text.secondary" mb={3}>View and respond to messages from tourists</Typography>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3, maxWidth: 700 }}>
        <List>
          {messages.map((msg, idx) => (
            <ListItem key={idx} alignItems="flex-start">
              <ListItemAvatar>
                <Badge color="error" variant="dot" invisible={idx !== 0}>
                  <Avatar><ChatIcon /></Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={<Typography fontWeight={600}>{msg.from}</Typography>}
                secondary={<>
                  <span style={{ color: 'rgba(0,0,0,0.87)' }}>{msg.text}</span>
                  <br />
                  <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.54)' }}>{msg.time}</span>
                </>}
              />
            </ListItem>
          ))}
        </List>
        <Box display="flex" gap={1} mt={2}>
          <TextField
            fullWidth
            size="small"
            placeholder="Type your message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          />
          <Button variant="contained" onClick={handleSend}>Send</Button>
        </Box>
      </Paper>
    </Box>
  );
}
