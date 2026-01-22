const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const checkUser = async () => {
    try {
        await connectDB();
        const user = await User.findOne({ email: 'admin@royalvilla.com' });
        if (user) {
            console.log('User Found:', {
                id: user._id,
                email: user.email,
                role: user.role
            });
        } else {
            console.log('User NOT Found');
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkUser();
