const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Room = require('./models/Room');
const connectDB = require('./config/db');

dotenv.config();

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany();
        await Room.deleteMany();

        // Create Admin User
        const admin = await User.create({
            name: 'James Wilson',
            email: 'admin@royalvilla.com',
            password: 'admin123',
            role: 'ADMIN',
            phone: '1234567890'
        });

        // Create Receptionist
        await User.create({
            name: 'Elena Rodriguez',
            email: 'reception@royalvilla.com',
            password: 'reception123',
            role: 'RECEPTION',
            phone: '0987654321'
        });

        // Create Cleaners
        await User.create({
            name: 'Marco Rossi',
            email: 'cleaner1@royalvilla.com',
            password: 'cleaner123',
            role: 'CLEANER',
            phone: '1122334455'
        });

        // Create Rooms
        const rooms = [];
        const types = ['SUITE', 'DOUBLE', 'SINGLE'];
        const prices = { 'SUITE': 250, 'DOUBLE': 150, 'SINGLE': 100 };
        for (let f = 1; f <= 4; f++) {
            for (let r = 1; r <= 10; r++) {
                const roomNum = f * 100 + r;
                const type = types[Math.floor(Math.random() * types.length)];
                rooms.push({
                    roomNumber: roomNum.toString(),
                    floor: f,
                    type: type,
                    pricePerNight: prices[type],
                    status: 'AVAILABLE'
                });
            }
        }
        await Room.insertMany(rooms);

        console.log('Data Seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedData();
