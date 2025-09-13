const express = require('express');
const multer = require('multer');
const path = require('path');
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get all bookings for authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all bookings (admin only)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const result = await pool.query(`
      SELECT b.*, u.first_name, u.last_name, u.email, u.phone 
      FROM bookings b 
      JOIN users u ON b.user_id = u.id 
      ORDER BY b.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new booking
router.post('/', authMiddleware, async (req, res) => {
  const { bookingDate, timeSlot, numberOfPlayers, equipment, totalPrice } = req.body;

  try {
    // Check if time slot is already booked
    const existingBooking = await pool.query(
      'SELECT * FROM bookings WHERE booking_date = $1 AND time_slot = $2 AND status != $3',
      [bookingDate, timeSlot, 'cancelled']
    );

    if (existingBooking.rows.length > 0) {
      return res.status(400).json({ message: 'Time slot is already booked' });
    }

    const result = await pool.query(
      'INSERT INTO bookings (user_id, booking_date, time_slot, number_of_players, equipment, total_price) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.id, bookingDate, timeSlot, numberOfPlayers, equipment, totalPrice]
    );

    const booking = result.rows[0];

    // Emit real-time notification
    const io = req.app.get('io');
    io.emit('new_booking', {
      message: 'New booking created',
      booking: booking
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single booking
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { bookingDate, timeSlot, numberOfPlayers, equipment, totalPrice } = req.body;

  try {
    // Check if booking belongs to user
    const bookingCheck = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if new time slot is available (exclude current booking)
    if (bookingDate && timeSlot) {
      const conflictCheck = await pool.query(
        'SELECT * FROM bookings WHERE booking_date = $1 AND time_slot = $2 AND id != $3 AND status != $4',
        [bookingDate, timeSlot, id, 'cancelled']
      );

      if (conflictCheck.rows.length > 0) {
        return res.status(400).json({ message: 'Time slot is already booked' });
      }
    }

    const result = await pool.query(
      'UPDATE bookings SET booking_date = $1, time_slot = $2, number_of_players = $3, equipment = $4, total_price = $5 WHERE id = $6 AND user_id = $7 RETURNING *',
      [bookingDate, timeSlot, numberOfPlayers, equipment, totalPrice, id, req.user.id]
    );

    const updatedBooking = result.rows[0];

    // Emit real-time notification
    const io = req.app.get('io');
    io.to(`user_${req.user.id}`).emit('booking_updated', {
      message: 'Booking updated',
      booking: updatedBooking
    });

    res.json(updatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel booking
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      ['cancelled', id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const cancelledBooking = result.rows[0];

    // Emit real-time notification
    const io = req.app.get('io');
    io.to(`user_${req.user.id}`).emit('booking_cancelled', {
      message: 'Booking cancelled',
      booking: cancelledBooking
    });

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload payment receipt
router.post('/:id/receipt', authMiddleware, upload.single('receipt'), async (req, res) => {
  const { id } = req.params;

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Update booking with receipt filename
    const result = await pool.query(
      'UPDATE bookings SET payment_receipt = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [req.file.filename, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const updatedBooking = result.rows[0];

    // Emit real-time notification
    const io = req.app.get('io');
    io.to(`user_${req.user.id}`).emit('receipt_uploaded', {
      message: 'Payment receipt uploaded',
      booking: updatedBooking
    });

    res.json({
      message: 'Receipt uploaded successfully',
      filename: req.file.filename,
      booking: updatedBooking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking status (admin only)
router.put('/:id/status', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const result = await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const updatedBooking = result.rows[0];

    // Get user info for notification
    const userResult = await pool.query('SELECT id FROM bookings WHERE id = $1', [id]);
    const userId = userResult.rows[0]?.user_id;

    // Emit real-time notification to user
    const io = req.app.get('io');
    if (userId) {
      io.to(`user_${userId}`).emit('booking_status_updated', {
        message: `Booking status updated to ${status}`,
        booking: updatedBooking
      });
    }

    res.json(updatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available time slots for a date
router.get('/availability/:date', async (req, res) => {
  const { date } = req.params;

  try {
    const bookedSlots = await pool.query(
      'SELECT time_slot FROM bookings WHERE booking_date = $1 AND status != $2',
      [date, 'cancelled']
    );

    const allTimeSlots = [
      '09:00-11:00',
      '11:30-13:30',
      '14:00-16:00',
      '16:30-18:30',
      '19:00-21:00'
    ];

    const bookedTimeSlots = bookedSlots.rows.map(row => row.time_slot);
    const availableSlots = allTimeSlots.filter(slot => !bookedTimeSlots.includes(slot));

    res.json({
      date,
      availableSlots,
      bookedSlots: bookedTimeSlots
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;