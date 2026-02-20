import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './home/LandingPage';
import Login from './Login';
import Register from './Register';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;
