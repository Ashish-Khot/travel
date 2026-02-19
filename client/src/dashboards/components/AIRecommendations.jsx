// AIRecommendations.jsx
// AI Recommended destinations card for dashboard
import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import StarIcon from '@mui/icons-material/Star';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import { motion } from 'framer-motion';

const recommendations = [
  {
    title: 'Maldives',
    desc: 'Based on your love for beach destinations',
    tag: 'Beach',
    price: '$3500',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: 'Iceland',
    desc: 'Perfect for adventure seekers',
    tag: 'Adventure',
    price: '$2800',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: 'Rome, Italy',
    desc: 'Matches your cultural interests',
    tag: 'Culture',
    price: '$2200',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=400&q=80',
  },
];

export default function AIRecommendations() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <Card sx={{ borderRadius: 4, boxShadow: 2, mb: 4 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={1}>
            <StarIcon sx={{ color: '#ffb300', mr: 1 }} />
            <Typography variant="h6" fontWeight={700}>
              AI Recommended For You
            </Typography>
            <Box flexGrow={1} />
            <Button size="small" sx={{ textTransform: 'none' }} endIcon={<span style={{ fontSize: 18 }}>&rarr;</span>}>
              View All
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Personalized destinations based on your preferences
          </Typography>
          <Grid container spacing={2}>
            {recommendations.map((rec) => (
              <Grid item xs={12} sm={4} key={rec.title}>
                <Card sx={{ borderRadius: 3, boxShadow: 1, height: '100%' }}>
                  <Box
                    component="img"
                    src={rec.image}
                    alt={rec.title}
                    sx={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 2, mb: 1 }}
                  />
                  <CardContent sx={{ pb: '16px !important' }}>
                    <Box display="flex" alignItems="center" mb={0.5}>
                      <Typography variant="subtitle1" fontWeight={700} flexGrow={1}>{rec.title}</Typography>
                      <Chip icon={<StarIcon sx={{ color: '#ffb300', fontSize: 18 }} />} label={rec.rating} size="small" sx={{ bgcolor: '#fffde7', fontWeight: 700, ml: 1 }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" mb={1}>{rec.desc}</Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip label={rec.tag} size="small" sx={{ bgcolor: '#e3f2fd', fontWeight: 600 }} />
                      <Typography variant="body2" fontWeight={700} color="primary.main">{rec.price}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );
}
