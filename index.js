import express from 'express';
import cors from 'cors';
import { generateToken, hashPassword, comparePassword, protect } from './constant.js';
import flights from './flightData.js';

const app = express();
app.use(express.json());
app.use(cors());

let users = [];
let bookings = [];

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send("Hello World");
});

app.post('/users/signup', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Please enter all fields' });
    }

    let user = users.find(u => u.email === email);
    if (user) {
        return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);

    user = {
        id: users.length + 1,
        name,
        email,
        password: hashedPassword
    };
    users.push(user);

    const token = generateToken(user.id);

    res.status(200).json({ token, userId: user.id });
});

app.post('/users/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Please enter all fields' });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.status(200).json({ token, userId: user.id });
});

app.get('/flights', (req, res) => {
    let filteredFlights = [...flights];

    // Search by origin and destination
    const { origin, destination } = req.query;
    if (origin) {
        filteredFlights = filteredFlights.filter(f => f.origin === origin.toUpperCase());
    }
    if (destination) {
        filteredFlights = filteredFlights.filter(f => f.destination === destination.toUpperCase());
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || filteredFlights.length;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedFlights = filteredFlights.slice(startIndex, endIndex);

    res.status(200).json({
        total: filteredFlights.length,
        page,
        limit,
        flights: paginatedFlights
    });
});

app.post('/bookings', protect, (req, res) => {
    const { userId, flightId } = req.body;

    if (!userId || !flightId) {
        return res.status(400).json({ error: 'Please provide userId and flightId' });
    }

    const flight = flights.find(f => f.id === flightId);
    if (!flight) {
        return res.status(404).json({ error: 'Flight not found' });
    }

    if (flight.availableSeats <= 0) {
        return res.status(400).json({ error: 'No seats available' });
    }

    flight.availableSeats--;

    const booking = {
        id: bookings.length + 1,
        userId,
        flightId,
        status: 'booked'
    };
    bookings.push(booking);

    res.status(200).json({ message: 'Flight booked successfully', booking });
});

app.post('/bookings/:id/cancel', protect, (req, res) => {
    const bookingId = parseInt(req.params.id);

    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.userId !== req.user) {
        return res.status(401).json({ error: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'cancelled') {
        return res.status(400).json({ error: 'Booking already cancelled' });
    }

    booking.status = 'cancelled';

    const flight = flights.find(f => f.id === booking.flightId);
    if (flight) {
        flight.availableSeats++;
    }

    res.status(200).json({ message: 'Booking cancelled successfully', booking });
});

app.get('/bookings/:userId', protect, (req, res) => {
    const userId = parseInt(req.params.userId);

    if (userId !== req.user) {
        return res.status(401).json({ error: 'Not authorized to view these bookings' });
    }

    const userBookings = bookings.filter(b => b.userId === userId);

    res.status(200).json(userBookings);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});