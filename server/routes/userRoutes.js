const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/users/me
// @desc    Get current user profile including saved trip plans
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/users/plannedTrips
// @desc    Sync all planned trip plans
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

// @route   POST api/users/savedTrips
// @desc    Sync all saved trip plans
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
