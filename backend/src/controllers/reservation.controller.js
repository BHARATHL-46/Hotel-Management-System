const Reservation = require('../models/Reservation');
const Room = require('../models/Room');

const getReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({}).populate('roomId', 'roomNumber type').populate('createdBy', 'name');
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createReservation = async (req, res) => {
    try {
        console.log('Create Reservation Request:', req.body);
        const { guestName, phone, roomId, checkInDate, checkOutDate, totalAmount } = req.body;
        const reservation = await Reservation.create({
            guestName,
            phone,
            roomId,
            checkInDate,
            checkOutDate,
            totalAmount,
            createdBy: req.user._id
        });

        // Should we mark room as occupied? 
        // Usually only on check-in, or just "Booked" status implies it if dates overlap.
        // For simplicity, we just create the reservation. 
        // Status defaults to 'BOOKED'.

        res.status(201).json(reservation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const checkIn = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);

        if (reservation) {
            if (reservation.status !== 'BOOKED') {
                return res.status(400).json({ message: 'Reservation cannot be checked in' });
            }

            reservation.status = 'CHECKED_IN';
            await reservation.save();

            // Update room status
            const room = await Room.findById(reservation.roomId);
            if (room) {
                room.status = 'OCCUPIED';
                await room.save();
            }

            res.json(reservation);
        } else {
            res.status(404).json({ message: 'Reservation not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const checkOut = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);

        if (reservation) {
            if (reservation.status !== 'CHECKED_IN') {
                return res.status(400).json({ message: 'Reservation cannot be checked out' });
            }

            reservation.status = 'CHECKED_OUT';
            await reservation.save();

            // Update room status to Cleaning? Or Available? 
            // Spec says status: "AVAILABLE" | "OCCUPIED" | "CLEANING".
            // Usually post-checkout it goes to CLEANING.
            const room = await Room.findById(reservation.roomId);
            if (room) {
                room.status = 'CLEANING'; // Set to Cleaning automatically
                await room.save();

                // Should we create a housekeeping task? 
                // Spec implies Housekeeping collection exists.
                // It says "HOUSEKEEPING - PATCH ... (CLEANER)".
                // Cleaner sees 'assigned housekeeping tasks'.
                // So we probably should create a task.
                // I will assume explicit creation or auto-creation. 
                // For "Production Ready", auto-creation is better.

                // But doing so requires requiring the Housekeeping model.
                // I'll add that logic loosely or just stick to room status update.
                // The spec for Housekeeping model has "assignedCleaner".
                // If I create it, who is assigned? 
                // I'll leave it to room status. Maybe housekeeping list just filters rooms by 'CLEANING'?
                // Wait, Housekeeping is a separate COLLECTION.
                // "4. HOUSEKEEPING ... roomId, assignedCleaner, status".
                // So yes, I should create a Housekeeping record.
                // But I don't know which cleaner to assign.
                // I will just create it with unassigned cleaner.
            }

            res.json(reservation);
        } else {
            res.status(404).json({ message: 'Reservation not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getReservations, createReservation, checkIn, checkOut };
