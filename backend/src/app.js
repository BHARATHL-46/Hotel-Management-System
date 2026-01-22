const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const roomRoutes = require('./routes/room.routes');
const reservationRoutes = require('./routes/reservation.routes');
const housekeepingRoutes = require('./routes/housekeeping.routes');
const userRoutes = require('./routes/user.routes');
const { getStats } = require('./controllers/dashboard.controller');
const { protect } = require('./middleware/auth.middleware');
const { authorize } = require('./middleware/role.middleware');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/housekeeping', housekeepingRoutes);
app.use('/api/users', userRoutes);

// Dashboard stats route
app.get('/api/dashboard/stats', protect, authorize('ADMIN', 'RECEPTION'), getStats);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(`ERROR [${req.method}] ${req.url}:`, err.message);
    if (err.stack) console.error(err.stack);

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

module.exports = app;
