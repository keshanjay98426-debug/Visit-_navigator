const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';

        let admin = await User.findOne({ email: adminEmail });

        if (!admin) {
            console.log('No admin user found. Seeding admin user...');

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            admin = new User({
                username: adminUsername,
                email: adminEmail,
                password: hashedPassword,
                role: 'admin'
            });

            await admin.save();
            console.log('Admin user seeded successfully!');
        } else {
            console.log('Admin user already exists.');
        }
    } catch (err) {
        console.error('Error seeding admin user:', err.message);
    }
};

module.exports = seedAdmin;