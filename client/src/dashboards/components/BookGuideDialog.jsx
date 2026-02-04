// BookGuideDialog.jsx - Modal for booking a guide
import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import GuideAvailabilityCalendar from './GuideAvailabilityCalendar';
import SlotPicker from './SlotPicker';
import axios from 'axios';

// Layout logic: Shows booking form with destination, start/end date, total price, and confirm/cancel buttons
export default function BookGuideDialog({ open, guide, onClose, onConfirm }) {
  const [destination, setDestination] = React.useState('');
  const [startDate, setStartDate] = React.useState(null);
  const [endDate, setEndDate] = React.useState(null);
  const [startTime, setStartTime] = React.useState(null);
  const [endTime, setEndTime] = React.useState(null);
  const [showCalendar, setShowCalendar] = React.useState(false);
  const [showSlotPicker, setShowSlotPicker] = React.useState(false);
  const [slotPickerDate, setSlotPickerDate] = React.useState(null);

  // Fetch busy dates when guide changes
  const [bookings, setBookings] = React.useState([]);
  React.useEffect(() => {
    if (!guide?.id && !guide?._id) return;
    axios.get(`/api/booking/guide/${guide.id || guide._id}`)
      .then(res => {
        const bookings = res.data.bookings || [];
        console.log('[DEBUG] BookGuideDialog fetched bookings:', bookings);
        setBookings(bookings);
      });
  }, [guide]);

  React.useEffect(() => {
    if (open) {
      setDestination('');
      setStartDate(null);
      setEndDate(null);
      setStartTime(null);
      setEndTime(null);
    }
  }, [open]);

  // Calculate total price based on date and time
  let totalPrice = 0;
  if (guide && startDate && endDate && startTime && endTime) {
    const start = dayjs(startDate).hour(dayjs(startTime).hour()).minute(dayjs(startTime).minute());
    const end = dayjs(endDate).hour(dayjs(endTime).hour()).minute(dayjs(endTime).minute());
    if (end.isAfter(start)) {
      const diffDays = end.startOf('day').diff(start.startOf('day'), 'day');
      if (diffDays === 0) {
        // Same day: price based on hours
        const diffHours = end.diff(start, 'hour', true);
        totalPrice = Math.ceil(diffHours) * guide.price / 24; // price for partial day (rounded up)
        if (totalPrice < guide.price) totalPrice = guide.price; // minimum one day price
      } else {
        // Multiple days: full days price
        totalPrice = (diffDays + 1) * guide.price;
      }
    }
  }

  // Date restrictions
  const today = dayjs().startOf('day');

  // Validation: End date/time must be after start date/time
  const isEndDateValid = !startDate || !endDate || dayjs(endDate).isAfter(dayjs(startDate)) || dayjs(endDate).isSame(dayjs(startDate));
  const isEndTimeValid = !startDate || !endDate || !startTime || !endTime || dayjs(endDate).isAfter(dayjs(startDate)) || (dayjs(endDate).isSame(dayjs(startDate)) ? (!startTime || !endTime || dayjs(endTime, 'HH:mm').isAfter(dayjs(startTime, 'HH:mm'))) : true);

  // Helper: get busy/partial/available days
  const getDayStatus = (date) => {
    const dayStart = dayjs(date).startOf('day');
    const dayEnd = dayjs(date).endOf('day');
    let busyHours = Array(24).fill(false);
    bookings.forEach(b => {
      const bStart = dayjs(b.startDateTime);
      const bEnd = dayjs(b.endDateTime);
      if (bEnd.isBefore(dayStart) || bStart.isAfter(dayEnd)) return;
      // Mark hours as busy
      let startHour = Math.max(0, bStart.isBefore(dayStart) ? 0 : bStart.hour());
      let endHour = Math.min(23, bEnd.isAfter(dayEnd) ? 23 : bEnd.hour() - (bEnd.minute() === 0 && bEnd.second() === 0 ? 1 : 0));
      for (let h = startHour; h <= endHour; h++) busyHours[h] = true;
    });
    const busyCount = busyHours.filter(Boolean).length;
    if (busyCount === 24) return 'full';
    if (busyCount > 0) return 'partial';
    return 'free';
  };

  // Helper to check if a date is fully busy
  const isDateBusy = date => getDayStatus(date) === 'full';
  const disableStartDate = date => isDateBusy(date);
  const disableEndDate = date => isDateBusy(date);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Book {guide?.name}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Button variant="outlined" onClick={() => setShowCalendar(v => !v)} sx={{ mb: 1 }}>
            {showCalendar ? 'Hide' : 'Show'} Availability Calendar
          </Button>
          {showCalendar && (guide?.id || guide?._id) && (
            <GuideAvailabilityCalendar
              guideId={guide.id || guide._id}
              onSelectDate={date => {
                const status = getDayStatus(date);
                if (status === 'free') setStartDate(date);
                else if (status === 'partial') {
                  setSlotPickerDate(date);
                  setShowSlotPicker(true);
                }
              }}
              selectedDate={startDate}
              bookings={bookings}
            />
          )}
          <TextField
            label="Destination"
            value={destination}
            onChange={e => setDestination(e.target.value)}
            fullWidth
          />
          {showSlotPicker && slotPickerDate && (
            <SlotPicker
              bookings={bookings}
              date={slotPickerDate}
              onSelectSlot={hour => {
                setStartDate(dayjs(slotPickerDate).hour(hour).minute(0).second(0));
                setStartTime(dayjs(slotPickerDate).hour(hour).minute(0).second(0));
                setShowSlotPicker(false);
              }}
            />
          )}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={date => {
                if (!isDateBusy(date)) {
                  setStartDate(date);
                  if (endDate && date && dayjs(endDate).isBefore(date)) setEndDate(null);
                }
              }}
              shouldDisableDate={disableStartDate}
              format="DD-MM-YYYY"
              minDate={today}
              slotProps={{ textField: { fullWidth: true } }}
            />
            <TimePicker
              label="Start Time"
              value={startTime}
              onChange={setStartTime}
              ampm={false}
              slotProps={{ textField: { fullWidth: true } }}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={date => {
                if (!isDateBusy(date)) {
                  setEndDate(date);
                  if (startDate && date && dayjs(date).isBefore(startDate)) setStartDate(null);
                }
              }}
              shouldDisableDate={disableEndDate}
              format="DD-MM-YYYY"
              minDate={startDate || today}
              slotProps={{ textField: { fullWidth: true, error: !isEndDateValid && Boolean(endDate), helperText: !isEndDateValid && Boolean(endDate) ? 'End date must be after start date' : '' } }}
            />
            <TimePicker
              label="End Time"
              value={endTime}
              onChange={setEndTime}
              ampm={false}
              slotProps={{ textField: { fullWidth: true, error: !isEndTimeValid && Boolean(endTime), helperText: !isEndTimeValid && Boolean(endTime) ? 'End time must be after start time' : '' } }}
            />
          </LocalizationProvider>
          <TextField
            label="Total Price"
            value={Number.isFinite(totalPrice) && totalPrice > 0 ? totalPrice.toFixed(2) : '0'}
            InputProps={{ readOnly: true }}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>Cancel</Button>
        <Button
          onClick={() => onConfirm({ destination, startDate, endDate, startTime, endTime, totalPrice })}
          variant="contained"
          color="primary"
          sx={{ borderRadius: 2 }}
          disabled={
            !destination || !startDate || !endDate || !startTime || !endTime || !isEndDateValid || !isEndTimeValid
          }
        >
          Confirm Booking
        </Button>
      </DialogActions>
    </Dialog>
  );
}
