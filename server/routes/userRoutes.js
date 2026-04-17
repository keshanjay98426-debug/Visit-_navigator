const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');


router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


router.post('/plannedTrips', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.plannedTrips = req.body.trips;
        await user.save();
        res.json(user.plannedTrips);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


router.post('/savedTrips', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.savedTrips = req.body.trips;
        await user.save();
        res.json(user.savedTrips);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;