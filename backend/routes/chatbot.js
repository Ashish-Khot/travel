const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// IMPORTANT: Move your API key to a .env file in production!
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';

router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
    const headers = {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    };
    const body = JSON.stringify({
      model: 'openai/gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful travel assistant.' },
        ...messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }))
      ],
      max_tokens: 256,
      temperature: 0.7
    });
    const response = await fetch(apiUrl, { method: 'POST', headers, body });
    if (!response.ok) {
      return res.status(500).json({ error: 'OpenRouter API error' });
    }
    const data = await response.json();
    res.json({ answer: data.choices?.[0]?.message?.content || 'No response.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
