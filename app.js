const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRouter = require("./routes/auth");
const guideProfileRouter = require('./routes/guideProfile');

const guideRouter = require('./routes/guide');
const bookingRouter = require('./routes/booking');
const adminGuideRouter = require('./routes/adminGuide');
const adminUserRouter = require('./routes/adminUser');

const adminDashboardRouter = require('./routes/adminDashboard');
const chatRoutes = require('./routes/chat');
const notificationsRoutes = require('./routes/notifications');
const travelogueRouter = require('./routes/travelogue');
const destinationRouter = require('./routes/destination');

const roomRouter = require('./routes/room');
const hotelRouter = require('./routes/hotel');
const hotelProfileRouter = require('./routes/hotelProfile');
const adminTravelogueRouter = require('./routes/adminTravelogue');

const touristRouter = require('./routes/tourist');
const guideAvatarRouter = require('./routes/guideAvatar');
const opentripmapRouter = require('./routes/opentripmap');
const hotelProfileInfoRouter = require('./routes/hotelProfileInfo');

const path = require('path');
const app = express();

connectDB();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json({ limit: '2mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/avatars', express.static(path.join(__dirname, 'uploads/avatars')));

// ===== API ROUTES =====
app.use("/api", authRouter);

// Admin routes
app.use('/api/admin', adminUserRouter);
app.use('/api/adminDashboard', adminDashboardRouter);
app.use('/api/adminGuide', adminGuideRouter);
app.use('/api/adminTravelogue', adminTravelogueRouter);

// Guide routes
app.use('/api/guide/profile', guideProfileRouter);
app.use('/api/guide', guideRouter);
app.use('/api/guideAvatar', guideAvatarRouter);

// Tourist routes (consolidated)
app.use('/api/tourist', touristRouter); // GET /:userId, PUT /:userId, POST /avatar/:userId

// Booking & Chat
app.use('/api/booking', bookingRouter);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationsRoutes);

// Content routes
app.use('/api/travelogue', travelogueRouter);
app.use('/api/destination', destinationRouter);

// Hotel routes
app.use('/api/hotel', hotelRouter);
app.use('/api/hotelProfile', hotelProfileRouter);
app.use('/api/hotelProfileInfo', hotelProfileInfoRouter);

// Other integrations
app.use('/api/opentripmap', opentripmapRouter);
app.use('/api/room', roomRouter);

// Health check
app.get("/", (req, res) => {
  res.send("API is running");
});

module.exports = app;
