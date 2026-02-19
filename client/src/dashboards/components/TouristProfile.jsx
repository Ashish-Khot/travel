import React, { useState, useEffect } from 'react';
import TouristProfileEdit from './TouristProfileEdit';
import api from '../../api';

export default function TouristProfile({ user: initialUser }) {
  const [user, setUser] = useState(initialUser);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch tourist profile from backend on mount
  useEffect(() => {
    const fetchTouristProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/tourist/${initialUser._id}`);
        setUser({ ...initialUser, ...res.data });
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    if (initialUser?._id) fetchTouristProfile();
  }, [initialUser?._id]);

  const handleSave = (updated) => {
    setUser((prev) => ({ ...prev, ...updated }));
    setError('');
  };

  if (loading) return <div>Loading profile...</div>;

  return (
    <>
      <TouristProfileEdit user={user} onSave={handleSave} />
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </>
  );
}
