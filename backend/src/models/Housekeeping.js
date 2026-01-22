const mongoose = require('mongoose');

const housekeepingSchema = new mongoose.Schema({
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    assignedCleaner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        enum: ['PENDING', 'CLEANING', 'CLEANED'],
        default: 'PENDING'
    }
}, { timestamps: true });

module.exports = mongoose.model('Housekeeping', housekeepingSchema);
