import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fff8 0%, #eafaf1 100%)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 48px 0 48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 32 }}>🌍</span>
          <span style={{ fontWeight: 700, fontSize: 24, color: '#2a4d3c' }}>Travelogue</span>
        </div>
        <nav style={{ display: 'flex', gap: 32, fontSize: 18, fontWeight: 500 }}>
          <span style={{ cursor: 'pointer' }}>Home</span>
          <span style={{ cursor: 'pointer' }}>Features</span>
          <span style={{ cursor: 'pointer' }}>Contact</span>
        </nav>
        <div style={{ display: 'flex', gap: 16 }}>
          <button style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 24, padding: '10px 28px', fontWeight: 700, fontSize: 18, cursor: 'pointer' }} onClick={() => navigate('/register')}>Get started</button>
          <button style={{ background: '#fff', color: '#2a4d3c', border: '1px solid #c2e7d2', borderRadius: 24, padding: '10px 28px', fontWeight: 700, fontSize: 18, cursor: 'pointer' }} onClick={() => navigate('/login')}>Login</button>
        </div>
      </header>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 32 }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: '#1a2a1a', marginBottom: 16, letterSpacing: '-2px', textAlign: 'center' }}>Your Journey. One Platform.</h1>
        <p style={{ fontSize: 22, color: '#3a4a3a', marginBottom: 24, textAlign: 'center', fontWeight: 500 }}>A Unified Travelogue Platform for Heritage Sites, Navigation, Stay, Food,<br />and Real-Time Assistance<br />Share Your Memories</p>
        <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
          <button style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 24, padding: '16px 36px', fontWeight: 700, fontSize: 22, cursor: 'pointer' }} onClick={() => navigate('/register')}>Get started →</button>
          <button style={{ background: '#fff', color: '#2a4d3c', border: '1px solid #c2e7d2', borderRadius: 24, padding: '16px 36px', fontWeight: 700, fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}><span role="img" aria-label="demo">📷</span> Try demo</button>
        </div>
        <div style={{ display: 'flex', gap: 32, marginBottom: 32, fontSize: 18, color: '#2a4d3c', fontWeight: 500, justifyContent: 'center' }}>
          <span>Discover More. Travel Smarter</span>
          <span>Every Journey Deserves a Story</span>
          <span>Where Culture Meets Technology</span>
          <span>Your Smart Companion for Every Trip</span>
        </div>
        <div style={{ fontSize: 15, color: '#7a8a7a', marginTop: 16, textAlign: 'center' }}>Trusted by leading travelers, including solo explorers, heritage lovers, and professional tour guides.</div>
      </main>
    </div>
  );
}
