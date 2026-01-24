


import React, { useEffect, useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import io from 'socket.io-client';
import api from '../../api';

const SOCKET_URL = 'http://localhost:3001';
const POST_TOUR_WINDOW_HOURS = 48; // Configurable post-tour window

export default function ChatPanel() {
  const [guides, setGuides] = useState([]);
  const [filteredGuides, setFilteredGuides] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [chatStatus, setChatStatus] = useState('ACTIVE');
  const [chatNotice, setChatNotice] = useState('');
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch user and guides
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
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

  // Fetch or create chat and messages when guide is selected
  useEffect(() => {
    if (!selectedGuide || !user) return;
    setLoading(true);
    setError('');
    api.get(`/chat/direct/${user.userId}/${selectedGuide.userId}`)
      .then(res => {
        setChatId(res.data.chatId);
        setMessages(res.data.messages || []);
        setChatStatus(res.data.status || 'ACTIVE');
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setError('Failed to load chat.');
      });
  }, [selectedGuide, user]);

  // Fetch chat status and messages when chatId changes
  useEffect(() => {
    if (!chatId) return;
    setLoading(true);
    api.get(`/chat/${chatId}`).then(resp => {
      setMessages(resp.data.messages || []);
      setChatStatus(resp.data.status || 'ACTIVE');
      setLoading(false);
    });
  }, [chatId]);

  // Socket.io setup for chat
  useEffect(() => {
    if (!chatId || !user) return;
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL);
    }
    socketRef.current.emit('joinRoom', { chatId, userId: user.userId });
    socketRef.current.off('newMessage');
    socketRef.current.on('newMessage', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => {
      if (socketRef.current) {
        socketRef.current.off('newMessage');
      }
    };
  }, [chatId, user]);

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

  const handleSend = async () => {
    if (!input.trim() || !chatId || !user || isInputDisabled) return;
    setLoading(true);
    try {
      // Send via REST for validation, then emit via socket for real-time
      const resp = await api.post(`/chat/${chatId}/message`, {
        content: input,
        messageType: 'TEXT'
      });
      setMessages(prev => [...prev, resp.data.message]);
      if (socketRef.current) {
        socketRef.current.emit('chatMessage', {
          chatId,
          senderId: user.userId,
          senderRole: user.role,
          content: input,
          messageType: 'TEXT'
        });
      }
      setInput('');
    } catch (err) {
      alert(err.response?.data?.error || 'Message failed');
    }
    setLoading(false);
  };

  // (Removed duplicate handleSend declaration)

  return (
    <Paper elevation={4} sx={{ display: 'flex', height: '70vh', bgcolor: '#f8fdf7', borderRadius: 4, boxShadow: 3, overflow: 'hidden' }}>
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
              onClick={() => setSelectedGuide({
                ...guide,
                avatar: guide.userId?.avatar || '',
                name: guide.userId?.name || '',
                country: guide.userId?.country || '',
              })}
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
          ) : error ? (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
              <Button onClick={() => setSelectedGuide(null)} color="primary" variant="outlined">Back</Button>
            </Box>
          ) : (
            <Box sx={{ flex: 1, px: 3, py: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
              {messages.length === 0 && (
                <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 8 }}>
                  No messages yet. Start the conversation!
                </Typography>
              )}
              {messages.map((msg, idx) => {
                const isMe = msg.senderId === user?.userId;
                return (
                  <Box key={msg._id || idx} sx={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems: 'flex-end', mb: 1 }}>
                    {!isMe && (
                      <Avatar src={selectedGuide?.avatar} sx={{ width: 32, height: 32, mr: 1, bgcolor: '#bdbdbd' }} />
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
                      <Avatar src={user?.avatar} sx={{ width: 32, height: 32, ml: 1, bgcolor: '#bdbdbd' }} />
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
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
            disabled={isInputDisabled || loading || !!error}
            inputProps={{ style: { fontSize: 16, padding: '12px' } }}
          />
          <Button
            variant="contained"
            color="success"
            sx={{ minWidth: 48, minHeight: 48, borderRadius: 2, fontWeight: 700, fontSize: 16, boxShadow: 'none', textTransform: 'none' }}
            onClick={handleSend}
            disabled={!input.trim() || isInputDisabled || loading || !!error}
          >
            Send
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
