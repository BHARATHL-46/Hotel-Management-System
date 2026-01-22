const Room = require('../models/Room');

const getRooms = async (req, res) => {
    try {
        const rooms = await Room.find({});
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createRoom = async (req, res) => {
    try {
        console.log('Create Room Request:', req.body);
        const { roomNumber, floor, type, pricePerNight, status } = req.body;
        const roomExists = await Room.findOne({ roomNumber });
        if (roomExists) {
            return res.status(400).json({ message: 'Room already exists' });
        }

        const room = await Room.create({
            roomNumber,
            floor,
            type,
            pricePerNight,
            status // Optional, defaults to AVAILABLE
        });

        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (room) {
            room.roomNumber = req.body.roomNumber || room.roomNumber;
            room.floor = req.body.floor || room.floor;
            room.type = req.body.type || room.type;
            room.pricePerNight = req.body.pricePerNight || room.pricePerNight;
            room.status = req.body.status || room.status;

            if (req.body.hasOwnProperty('assignedTo')) {
                room.assignedTo = req.body.assignedTo;
            }

            const updatedRoom = await room.save();
            res.json(updatedRoom);
        } else {
            res.status(404).json({ message: 'Room not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getRooms, createRoom, updateRoom };
