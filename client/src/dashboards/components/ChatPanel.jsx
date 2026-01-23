

import React, { useEffect, useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import io from 'socket.io-client';
import api from '../../api';

const SOCKET_URL = 'http://localhost:3001';

export default function ChatPanel() {
  const [guides, setGuides] = useState([]);
  const [filteredGuides, setFilteredGuides] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch user and guides
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    // Fetch all guides from backend
    api.get('/guide').then(res => {
      setGuides(res.data.guides || []);
      setFilteredGuides(res.data.guides || []);
    });
  }, []);

  // Filter guides by search
  useEffect(() => {
    if (!search) {
      setFilteredGuides(guides);
    } else {
      setFilteredGuides(
        guides.filter(g =>
          g.name?.toLowerCase().includes(search.toLowerCase()) ||
          g.email?.toLowerCase().includes(search.toLowerCase()) ||
          g.country?.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, guides]);

  // Fetch or create booking when guide is selected
  useEffect(() => {
    if (!selectedGuide || !user) return;
    // Find or create booking between user and guide
    api.get(`/booking/tourist/${user.userId}`).then(res => {
      const bookings = res.data.bookings || [];
      let booking = bookings.find(b => b.guideId?._id === selectedGuide.userId);
      if (booking) {
        setBookingId(booking._id);
        setMessages(booking.messages || []);
      } else {
        // Create booking if not exists (for chat purposes)
        api.post('/booking/book', {
          guideId: selectedGuide.userId,
          date: new Date(),
          destination: 'Chat',
          price: 0
        }).then(resp => {
          setBookingId(resp.data.booking._id);
          setMessages([]);
        });
      }
    });
  }, [selectedGuide, user]);

  // Socket.io setup for chat
  useEffect(() => {
    if (!bookingId) return;
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL);
    }
    socketRef.current.emit('joinRoom', { bookingId });
    socketRef.current.off('newMessage');
    socketRef.current.on('newMessage', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => {
      if (socketRef.current) {
        socketRef.current.off('newMessage');
      }
    };
  }, [bookingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !bookingId || !user) return;
    socketRef.current.emit('chatMessage', {
      bookingId,
      senderId: user.userId,
      content: input
    });
    setInput('');
  };

  return (
    <Box sx={{ display: 'flex', height: '70vh', bgcolor: '#fcfdf9', borderRadius: 4, boxShadow: 2, overflow: 'hidden' }}>
      {/* Guide List */}
      <Box sx={{ width: 320, bgcolor: '#fff', borderRight: '1.5px solid #e0e0e0', p: 0, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 3, pb: 1 }}>
          <Typography variant="h4" fontWeight={800} mb={0.5} sx={{ fontFamily: 'serif' }}>Messages</Typography>
          <Typography variant="subtitle2" color="text.secondary" mb={2}>
            Chat with your guides in real-time
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Search guides..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: { borderRadius: 2, bgcolor: '#f7f7f7' }
            }}
            sx={{ mb: 2 }}
          />
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto', px: 1, pb: 2 }}>
          {filteredGuides.map((guide) => (
            <Box
              key={guide.userId?._id || guide.userId}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 1.2,
                mb: 1,
                borderRadius: 2,
                cursor: 'pointer',
                bgcolor: selectedGuide?.userId?._id === guide.userId?._id ? '#eafbe7' : 'transparent',
                transition: 'background 0.2s',
                '&:hover': { bgcolor: '#f0f7f4' }
              }}
              onClick={() => setSelectedGuide(guide)}
            >
              <Avatar src={guide.userId?.avatar} alt={guide.userId?.name} sx={{ width: 44, height: 44, border: selectedGuide?.userId?._id === guide.userId?._id ? '2px solid #388e3c' : '2px solid #fff' }} />
              <Box>
                <Typography fontWeight={700} fontSize={17}>{guide.userId?.name || 'No Name'}</Typography>
                <Typography fontSize={13} color="text.secondary">{guide.userId?.country || ''}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
      {/* Chat Window */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#f8fdf7', borderRadius: 0, p: 0 }}>
        {selectedGuide && (
          <Box sx={{ display: 'flex', alignItems: 'center', p: 3, bgcolor: '#f4fbf6', borderBottom: '1.5px solid #e0e0e0' }}>
            <Avatar src={selectedGuide.avatar} alt={selectedGuide.name} sx={{ width: 44, height: 44, mr: 2 }} />
            <Box>
              <Typography fontWeight={700} fontSize={18}>{selectedGuide.name}</Typography>
              <Typography fontSize={13} color="text.secondary">{selectedGuide.country}</Typography>
            </Box>
          </Box>
        )}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 4, py: 3, bgcolor: '#f8fdf7' }}>
          {messages.map((msg, idx) => (
            <Box key={idx} sx={{ display: 'flex', justifyContent: msg.sender === user?.userId ? 'flex-end' : 'flex-start', mb: 2 }}>
              <Box sx={{ bgcolor: msg.sender === user?.userId ? '#256029' : '#e0e0e0', color: msg.sender === user?.userId ? '#fff' : 'text.primary', px: 2.5, py: 1.5, borderRadius: 2, maxWidth: 340, boxShadow: 1 }}>
                <Typography fontWeight={700} fontSize={14} sx={{ mb: 0.5 }}>{msg.sender === user?.userId ? 'You' : selectedGuide?.name}</Typography>
                <Typography fontSize={15}>{msg.text}</Typography>
                <Typography fontSize={11} sx={{ mt: 0.5, textAlign: 'right', opacity: 0.7 }}>{new Date(msg.sentAt).toLocaleTimeString()}</Typography>
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#fff',
            p: 2,
            borderTop: '1.5px solid #e0e0e0',
            boxShadow: '0 1px 4px 0 rgba(76,175,80,0.04)',
            mt: 'auto',
          }}
        >
          <TextField
            fullWidth
            placeholder="Type your message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ bgcolor: '#f7f7f7', borderRadius: 2, mr: 2 }}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          />
          <IconButton
            color="primary"
            sx={{ borderRadius: 2, bgcolor: '#256029', color: '#fff', '&:hover': { bgcolor: '#388e3c' }, width: 48, height: 48 }}
            onClick={handleSend}
            disabled={!input.trim()}
          >
            <SendOutlinedIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
