const Housekeeping = require('../models/Housekeeping');
const Room = require('../models/Room');

const getTasks = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'CLEANER') {
            query = { assignedCleaner: req.user._id };
        }

        const tasks = await Housekeeping.find(query)
            .populate('roomId', 'roomNumber floor type status')
            .populate('assignedCleaner', 'name');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateTaskStatus = async (req, res) => {
    const { status } = req.body;
    const { roomId } = req.params;

    try {
        // Find housekeeping task for this room. 
        // Assuming one active task per room usually, or we match by roomId.
        // If the path is /:roomId/status, we search by roomId.
        // But we should probably check if it's the assigned cleaner if applicable.

        // NOTE: Spec says /housekeeping/:roomId/status
        // Ideally should be /:id, but following spec.
        // We'll find the most recent or active task for the room?
        // Or just find one.

        const task = await Housekeeping.findOne({ roomId: roomId }).sort({ createdAt: -1 });

        if (!task) {
            return res.status(404).json({ message: 'Housekeeping task not found for this room' });
        }

        if (req.user.role === 'CLEANER' && task.assignedCleaner && task.assignedCleaner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this task' });
        }

        task.status = status;
        await task.save();

        // If cleaned, update Room status to AVAILABLE
        if (status === 'CLEANED') {
            const room = await Room.findById(roomId);
            if (room) {
                room.status = 'AVAILABLE';
                await room.save();
            }
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getTasks, updateTaskStatus };
