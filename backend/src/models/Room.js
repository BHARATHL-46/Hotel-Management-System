const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true, unique: true },
    floor: { type: Number, required: true },
    type: {
        type: String,
        enum: ['SINGLE', 'DOUBLE', 'SUITE'],
        required: true
    },
    status: {
        type: String,
        enum: ['AVAILABLE', 'OCCUPIED', 'CLEANING'],
        default: 'AVAILABLE'
    },
    pricePerNight: { type: Number, required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Room', roomSchema);
