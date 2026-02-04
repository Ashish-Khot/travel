import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import dayjs from 'dayjs';

const BOOKED_COLOR = '#ffb3b3';
const PARTIAL_COLOR = '#ffe299';
const AVAILABLE_COLOR = '#b3ffb3';

// bookings: array of { startDateTime, endDateTime }
export default function GuideAvailabilityCalendar({ guideId, onSelectDate, selectedDate, bookings = [] }) {
  // Helper: get day status (full, partial, free) and available hours
  function getDayStatus(date) {
    const dayStart = dayjs(date).startOf('day');
    const dayEnd = dayjs(date).endOf('day');
    let busyHours = Array(24).fill(false);
    bookings.forEach(b => {
      const bStart = dayjs(b.startDateTime);
      const bEnd = dayjs(b.endDateTime);
      // If booking overlaps this day
      if (bEnd.isBefore(dayStart) || bStart.isAfter(dayEnd)) return;
      let startHour = Math.max(0, bStart.isBefore(dayStart) ? 0 : bStart.hour());
      let endHour = Math.min(23, bEnd.isAfter(dayEnd) ? 23 : bEnd.hour() - (bEnd.minute() === 0 && bEnd.second() === 0 ? 1 : 0));
      for (let h = startHour; h <= endHour; h++) busyHours[h] = true;
    });
    const busyCount = busyHours.filter(Boolean).length;
    let status = 'free';
    if (busyCount === 24) status = 'full';
    else if (busyCount > 0) status = 'partial';
    const availableHours = busyHours.map((b, i) => !b ? i : null).filter(v => v !== null);
    return { status, availableHours };
  }

  // Custom day renderer
  function renderDay(day, _value, DayComponentProps) {
    const { status, availableHours } = getDayStatus(day);
    let color = AVAILABLE_COLOR;
    if (status === 'full') color = BOOKED_COLOR;
    else if (status === 'partial') color = PARTIAL_COLOR;
    const showTooltip = status === 'partial';
    const tooltipTitle = showTooltip
      ? `Available hours: ${availableHours.length > 0 ? availableHours.map(h => `${h}:00`).join(', ') : 'None'}`
      : '';
    const box = (
      <Box
        {...DayComponentProps}
        sx={{
          bgcolor: color,
          borderRadius: '50%',
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: status === 'full' ? 'not-allowed' : 'pointer',
          opacity: status === 'full' ? 0.5 : 1,
        }}
        onClick={status === 'full' ? undefined : () => onSelectDate(day)}
      >
        <Typography variant="body2">{day.date()}</Typography>
      </Box>
    );
    return showTooltip ? <Tooltip title={tooltipTitle} arrow>{box}</Tooltip> : box;
  }

  return (
    <Box>
      <Typography variant="subtitle1" mb={1}>Guide Availability</Typography>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <StaticDatePicker
          displayStaticWrapperAs="desktop"
          value={selectedDate}
          onChange={onSelectDate}
          renderDay={renderDay}
        />
      </LocalizationProvider>
      <Box mt={2} display="flex" gap={2} alignItems="center">
        <Box width={16} height={16} bgcolor={BOOKED_COLOR} borderRadius={2} />
        <Typography variant="caption">Booked</Typography>
        <Box width={16} height={16} bgcolor={PARTIAL_COLOR} borderRadius={2} />
        <Typography variant="caption">Partially Booked</Typography>
        <Box width={16} height={16} bgcolor={AVAILABLE_COLOR} borderRadius={2} />
        <Typography variant="caption">Available</Typography>
      </Box>
    </Box>
  );
}
