const Room = require('../models/Room');
const Reservation = require('../models/Reservation');
const User = require('../models/User');
const Housekeeping = require('../models/Housekeeping');

const getStats = async (req, res) => {
    try {
        const totalRooms = await Room.countDocuments();
        const availableRooms = await Room.countDocuments({ status: 'AVAILABLE' });
        const occupiedRooms = await Room.countDocuments({ status: 'OCCUPIED' });
        const cleaningRooms = await Room.countDocuments({ status: 'CLEANING' });

        // Reservations stats (maybe for today?)
        const activeReservations = await Reservation.countDocuments({ status: { $in: ['BOOKED', 'CHECKED_IN'] } });

        const stats = {
            rooms: {
                total: totalRooms,
                available: availableRooms,
                occupied: occupiedRooms,
                cleaning: cleaningRooms
            },
            reservations: {
                active: activeReservations
            }
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getStats };
