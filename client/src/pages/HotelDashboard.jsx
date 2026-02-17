
import React, { useState } from "react";
import { Box } from "@mui/material";

import HotelDashboardSidebar from "./HotelDashboardSidebar";
import HotelDashboardOverview from "./HotelDashboardOverview";
import HotelProfile from "./HotelProfile";
import RoomManagement from "./RoomManagement";
import BookingManagement from "./BookingManagement";
import HotelChat from "./HotelChat";
import HotelReviews from "./HotelReviews";
import HotelNotifications from "./HotelNotifications";
import HotelAnalytics from "./HotelAnalytics";
import HotelSettings from "./HotelSettings";

const sectionComponents = {
  dashboard: <HotelDashboardOverview />,
  profile: <HotelProfile />,
  rooms: <RoomManagement />,
  bookings: <BookingManagement />,
  chat: <HotelChat />,
  reviews: <HotelReviews />,
  notifications: <HotelNotifications />,
  analytics: <HotelAnalytics />,
  settings: <HotelSettings />,
};

export default function HotelDashboard() {
  const [section, setSection] = useState("dashboard");
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#fafbfa' }}>
      <HotelDashboardSidebar selected={section} onSelect={setSection} />
      <Box sx={{ flex: 1, p: { xs: 2, md: 5 }, pl: { xs: 0, md: 8 }, background: '#fafbfa' }}>
        {sectionComponents[section]}
      </Box>
    </Box>
  );
}
