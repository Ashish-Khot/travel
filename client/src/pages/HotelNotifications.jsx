import React, { useState } from "react";
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, IconButton, Badge } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

const initialNotifications = [
  { text: "New booking from John Doe", time: "1 min ago", read: false },
  { text: "New message from Tourist 2", time: "5 min ago", read: false },
  { text: "Room availability updated", time: "1 hr ago", read: true },
];

export default function HotelNotifications() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const handleMarkRead = idx => {
    setNotifications(notifications.map((n, i) => i === idx ? { ...n, read: true } : n));
  };
  const handleDelete = idx => {
    setNotifications(notifications.filter((_, i) => i !== idx));
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={1}>Notifications</Typography>
      <Typography color="text.secondary" mb={3}>Alerts for new bookings, messages, and reviews</Typography>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3, maxWidth: 700 }}>
        <List>
          {notifications.map((n, idx) => (
            <ListItem key={idx} secondaryAction={
              <>
                {!n.read && (
                  <IconButton color="success" onClick={() => handleMarkRead(idx)}><CheckIcon /></IconButton>
                )}
                <IconButton color="error" onClick={() => handleDelete(idx)}><CloseIcon /></IconButton>
              </>
            }>
              <ListItemIcon>
                <Badge color="error" variant="dot" invisible={n.read}>
                  <NotificationsIcon color={n.read ? "disabled" : "primary"} />
                </Badge>
              </ListItemIcon>
              <ListItemText
                primary={n.text}
                secondary={<Typography variant="caption" color="text.secondary">{n.time}</Typography>}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}
