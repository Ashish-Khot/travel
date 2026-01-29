import React, { useEffect, useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import io from 'socket.io-client';
import api from '../../api';

const SOCKET_URL = 'http://localhost:3001';

export default function GuideChatPanel({ guideId }) {
  const [tourists, setTourists] = useState([]);
  const [filteredTourists, setFilteredTourists] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTourist, setSelectedTourist] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chatId, setChatId] = useState(null);
  const [chatStatus, setChatStatus] = useState('ACTIVE');
  const [chatNotice, setChatNotice] = useState('');
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch tourists who have bookings with this guide
  useEffect(() => {
    if (!guideId) return;
    setLoading(true);
    api.get(`/booking/guide/${guideId}`).then(res => {
      const touristsList = (res.data.bookings || [])
        .map(b => b.touristId)
        .filter((v, i, a) => v && a.findIndex(t => t._id === v._id) === i);
      setTourists(touristsList);
      setFilteredTourists(touristsList);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
      setError('Failed to load tourists.');
    });
  }, [guideId]);

  // Filter tourists by search
  useEffect(() => {
    if (!search) {
      setFilteredTourists(tourists);
    } else {
      setFilteredTourists(
        tourists.filter(t =>
          t.name?.toLowerCase().includes(search.toLowerCase()) ||
          t.email?.toLowerCase().includes(search.toLowerCase()) ||
          t.country?.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, tourists]);

  // Fetch or create chat and messages when tourist is selected
  useEffect(() => {
    if (!selectedTourist || !guideId) return;
    setLoading(true);
    setError('');
    setMessages([]);
    setChatId(null);
    api.get(`/chat/direct/${selectedTourist._id}/${guideId}`)
      .then(res => {
        setChatId(res.data.chatId);
        setMessages(res.data.messages || []);
        setChatStatus(res.data.status || 'ACTIVE');
        setLoading(false);
      })
      .catch((err) => {
        // Only show error if it's a real API/server error, not just no chat yet
        setLoading(false);
        setError('Failed to load chat.');
      });
  }, [selectedTourist, guideId]);

  // Socket.io setup for chat
  useEffect(() => {
    if (!chatId || !guideId) return;
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL);
    }
    socketRef.current.emit('joinRoom', { chatId, userId: guideId });
    socketRef.current.off('newMessage');
    socketRef.current.on('newMessage', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => {
      if (socketRef.current) {
        socketRef.current.off('newMessage');
      }
    };
  }, [chatId, guideId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Chat status and input control
  useEffect(() => {
    let notice = '';
    let disabled = false;
    if (chatStatus === 'POST_TOUR') {
      notice = 'Chat is in post-tour mode.';
    }
    if (chatStatus === 'LOCKED') {
      notice = 'Chat is locked due to a dispute.';
      disabled = true;
    }
    if (chatStatus === 'CLOSED') {
      notice = 'Chat is closed. You can view previous messages.';
      disabled = true;
    }
    setChatNotice(notice);
    setIsInputDisabled(disabled);
  }, [chatStatus]);

  // Prevent double send by debouncing handleSend
  const sendingRef = useRef(false);
  const handleSend = async () => {
    if (sendingRef.current) return;
    if (!input.trim() || isInputDisabled || !chatId) return;
    sendingRef.current = true;
    setLoading(true);
    try {
      let resp;
      // If this is a direct chat (bookingId is null), use the direct message endpoint
      if (selectedTourist && chatId && tourists.find(t => t._id === selectedTourist._id)) {
        resp = await api.post(`/chat/direct/${selectedTourist._id}/${guideId}/message`, {
          content: input,
          messageType: 'TEXT'
        });
        // If chatId was just created, update it
        if (resp.data.chatId && resp.data.chatId !== chatId) {
          setChatId(resp.data.chatId);
        }
      } else {
        // fallback for booking-based chat (should not happen in this panel)
        resp = await api.post(`/chat/${chatId}/message`, {
          content: input,
          messageType: 'TEXT'
        });
      }
      // Do not update messages here; rely on socket event only
      if (socketRef.current && chatId) {
        socketRef.current.emit('chatMessage', {
          chatId,
          senderId: guideId,
          senderRole: 'guide',
          content: input,
          messageType: 'TEXT'
        });
      }
      setInput('');
    } catch (err) {
      alert(err.response?.data?.error || 'Message failed');
    }
    setLoading(false);
    setTimeout(() => { sendingRef.current = false; }, 250); // allow next send after short delay
  };

  return (
    <Paper elevation={4} sx={{ display: 'flex', height: '70vh', bgcolor: '#f8fdf7', borderRadius: 4, boxShadow: 3, overflow: 'hidden' }}>
      {/* Tourist List */}
      <Box sx={{ width: 320, bgcolor: '#fff', borderRight: '1.5px solid #e0e0e0', p: 0, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 3, pb: 1 }}>
          <Typography variant="h4" fontWeight={800} mb={0.5} sx={{ fontFamily: 'serif' }}>Messages</Typography>
          <Typography variant="subtitle2" color="text.secondary" mb={2}>
            Chat with your tourists in real-time
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Search tourists..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ mb: 2 }}
          />
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto', px: 1, pb: 2 }}>
          {filteredTourists.map((tourist) => (
            <Box
              key={tourist._id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 1.2,
                mb: 1,
                borderRadius: 2,
                cursor: 'pointer',
                bgcolor: selectedTourist?._id === tourist._id ? '#eafbe7' : 'transparent',
                transition: 'background 0.2s',
                '&:hover': { bgcolor: '#f0f7f4' }
              }}
              onClick={() => setSelectedTourist(tourist)}
            >
              <Avatar src={tourist.avatar} alt={tourist.name} sx={{ width: 44, height: 44, border: selectedTourist?._id === tourist._id ? '2px solid #388e3c' : '2px solid #fff' }} />
              <Box>
                <Typography fontWeight={700} fontSize={17}>{tourist.name || 'No Name'}</Typography>
                <Typography fontSize={13} color="text.secondary">{tourist.country || ''}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
      {/* Chat Window */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#f8fdf7', borderRadius: 0, p: 0 }}>
        {selectedTourist && (
          <Box sx={{ display: 'flex', alignItems: 'center', p: 3, bgcolor: '#f4fbf6', borderBottom: '1.5px solid #e0e0e0' }}>
            <Avatar src={selectedTourist.avatar} alt={selectedTourist.name} sx={{ width: 44, height: 44, mr: 2 }} />
            <Box>
              <Typography fontWeight={700} fontSize={18}>{selectedTourist.name}</Typography>
              <Typography fontSize={13} color="text.secondary">{selectedTourist.country}</Typography>
            </Box>
          </Box>
        )}
        {/* Chat status banner */}
        {chatNotice && (
          <Box sx={{ px: 3, py: 1, bgcolor: chatStatus === 'LOCKED' ? '#ffe0e0' : chatStatus === 'POST_TOUR' ? '#fffbe6' : chatStatus === 'CLOSED' ? '#f0f0f0' : '#eafbe7', borderBottom: '1.5px solid #e0e0e0' }}>
            <Chip label={chatNotice} color={chatStatus === 'LOCKED' ? 'error' : chatStatus === 'POST_TOUR' ? 'warning' : chatStatus === 'CLOSED' ? 'default' : 'success'} />
          </Box>
        )}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 0, py: 0, bgcolor: '#ece5dd', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          {loading ? (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : error && !chatId ? (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
              <Button onClick={() => setSelectedTourist(null)} color="primary" variant="outlined">Back</Button>
            </Box>
          ) : (
            <Box sx={{ flex: 1, px: 3, py: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
              {messages.length === 0 && (
                <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 8 }}>
                  No messages yet. Start the conversation!
                </Typography>
              )}
              {messages.map((msg, idx) => {
                const isMe = msg.senderId === guideId;
                // Get guide avatar from localStorage user
                let guideAvatar = '';
                try {
                  const user = JSON.parse(localStorage.getItem('user'));
                  guideAvatar = user?.avatar || '';
                } catch {}
                return (
                  <Box key={msg._id || idx} sx={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems: 'flex-end', mb: 1 }}>
                    {!isMe && (
                      <Avatar src={selectedTourist?.avatar} sx={{ width: 32, height: 32, mr: 1, bgcolor: '#bdbdbd' }} />
                    )}
                    <Box sx={{
                      bgcolor: isMe ? '#dcf8c6' : '#fff',
                      color: 'text.primary',
                      px: 2,
                      py: 1.2,
                      borderRadius: isMe ? '16px 16px 0 16px' : '16px 16px 16px 0',
                      maxWidth: 380,
                      boxShadow: 1,
                      position: 'relative',
                    }}>
                      <Typography fontSize={15} sx={{ wordBreak: 'break-word' }}>{msg.content}</Typography>
                      <Typography fontSize={11} sx={{ mt: 0.5, textAlign: 'right', opacity: 0.7 }}>
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : ''}
                      </Typography>
                    </Box>
                    {isMe && (
                      <Avatar src={guideAvatar} sx={{ width: 32, height: 32, ml: 1, bgcolor: '#bdbdbd' }} />
                    )}
                  </Box>
                );
              })}
              <div ref={messagesEndRef} />
            </Box>
          )}
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#fafafa',
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
            size="medium"
            sx={{ bgcolor: '#fff', borderRadius: 3, mr: 2, fontSize: 16 }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isInputDisabled || loading || !!error || !chatId}
            inputProps={{ style: { fontSize: 16, padding: '12px' } }}
          />
          <Button
            variant="contained"
            color="success"
            sx={{ minWidth: 48, minHeight: 48, borderRadius: 2, fontWeight: 700, fontSize: 16, boxShadow: 'none', textTransform: 'none' }}
            onClick={e => {
              e.preventDefault();
              handleSend();
            }}
            disabled={!input.trim() || isInputDisabled || loading || !!error || !chatId}
          >
            Send
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
