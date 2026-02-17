const express = require("express");
const router = express.Router();
const Room = require("../models/Room");
const { verifyToken } = require("../middleware/auth");

// Get all rooms for a specific hotel
router.get("/hotel/:hotelId", verifyToken, async (req, res) => {
  try {
    const rooms = await Room.find({ hotel: req.params.hotelId });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new room for a hotel
router.post("/hotel/:hotelId", verifyToken, async (req, res) => {
  try {
    const { type, price, total, available, status } = req.body;
    const room = new Room({
      hotel: req.params.hotelId,
      type,
      price,
      total,
      available,
      status: status || "Available"
    });
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a room
router.put("/:roomId", verifyToken, async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.roomId, req.body, { new: true });
    res.json(room);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a room
router.delete("/:roomId", verifyToken, async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.roomId);
    res.json({ message: "Room deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
