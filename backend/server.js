const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-Memory Data Storage
let resources = [
  { id: 'workspace-a', name: 'Cyber Lab Alpha', type: 'High-Performance Workstation', capacity: 4, icon: 'Cpu' },
  { id: 'workspace-b', name: 'Quantum Pod 01', type: 'Soundproof Focus Capsule', capacity: 1, icon: 'Radio' },
  { id: 'lounge-v', name: 'Neon VR Lounge', type: 'Immersive VR Studio', capacity: 6, icon: 'Tv' },
  { id: 'conf-matrix', name: 'The Matrix Boardroom', type: 'Executive Conference Room', capacity: 12, icon: 'Shield' }
];

// Master Available Time Slots (24h format HH:00)
const MASTER_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

let bookings = [
  {
    id: 'res-101',
    resourceId: 'workspace-a',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '10:00',
    userName: 'Brayden Gill',
    userEmail: 'brayden@devnode.io',
    notes: 'Urgent sprint deployment'
  }
];

// 1. GET /api/resources - List all available resources
app.get('/api/resources', (req, res) => {
  res.json({ success: true, data: resources });
});

// 2. GET /api/slots?date=YYYY-MM-DD&resourceId=xyz
app.get('/api/slots', (req, res) => {
  const { date, resourceId } = req.query;

  if (!date || !resourceId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required query parameters: date and resourceId are required.' 
    });
  }

  // Find confirmed bookings for this date and resource
  const reservedSlots = bookings
    .filter(b => b.date === date && b.resourceId === resourceId)
    .map(b => b.timeSlot);

  // Return slots marked with availability
  const slotsStatus = MASTER_SLOTS.map(slot => ({
    time: slot,
    available: !reservedSlots.includes(slot)
  }));

  res.json({ success: true, date, resourceId, slots: slotsStatus });
});

// 3. GET /api/bookings/:date/:resource
app.get('/api/bookings/:date/:resource', (req, res) => {
  const { date, resource } = req.params;

  const filteredBookings = bookings.filter(
    b => b.date === date && b.resourceId === resource
  );

  res.json({ success: true, count: filteredBookings.length, data: filteredBookings });
});

// 4. POST /api/bookings - Create new reservation with strict conflict validation
app.post('/api/bookings', (req, res) => {
  const { resourceId, date, timeSlot, userName, userEmail, notes } = req.body;

  // Validation
  if (!resourceId || !date || !timeSlot || !userName || !userEmail) {
    return res.status(400).json({
      success: false,
      error: 'All fields (resourceId, date, timeSlot, userName, userEmail) are required.'
    });
  }

  // Conflict Detection Logic
  const conflict = bookings.find(
    b => b.resourceId === resourceId && b.date === date && b.timeSlot === timeSlot
  );

  if (conflict) {
    return res.status(409).json({
      success: false,
      error: `Conflict Detected: Slot ${timeSlot} on ${date} for resource ${resourceId} is already booked!`
    });
  }

  const newBooking = {
    id: `res-${Date.now().toString().slice(-5)}`,
    resourceId,
    date,
    timeSlot,
    userName,
    userEmail,
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  bookings.push(newBooking);

  res.status(201).json({
    success: true,
    message: 'Reservation created successfully!',
    data: newBooking
  });
});

// 5. DELETE /api/bookings/:id - Cancel a booking
app.delete('/api/bookings/:id', (req, res) => {
  const { id } = req.params;

  const index = bookings.findIndex(b => b.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: `Booking with ID '${id}' not found.`
    });
  }

  const deletedBooking = bookings.splice(index, 1)[0];

  res.json({
    success: true,
    message: `Booking ${id} has been successfully canceled.`,
    data: deletedBooking
  });
});

app.listen(PORT, () => {
  console.log(`⚡ Reserva Cyberpunk Backend API running on http://localhost:${PORT}`);
});
