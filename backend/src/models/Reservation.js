const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    guestName: { type: String, required: true },
    phone: { type: String, required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    status: {
        type: String,
        enum: ['BOOKED', 'CHECKED_IN', 'CHECKED_OUT'],
        default: 'BOOKED'
    },
    totalAmount: { type: Number, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
