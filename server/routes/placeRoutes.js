const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const Place = require('../models/Place');

// @route   GET api/places
// @desc    Get all places with optional search and category filters
router.get('/', async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = {};
        
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        if (category) {
            query.category = category;
        }

        const places = await Place.find(query).populate('category', 'name');
        res.json(places);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/places/:id
// @desc    Get place by ID
router.get('/:id', async (req, res) => {
    try {
        const place = await Place.findById(req.params.id).populate('category', 'name');
        if (!place) {
            return res.status(404).json({ msg: 'Place not found' });
        }
        res.json(place);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Place not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   POST api/places
// @desc    Create a place (Admin only)
router.post('/', [auth, roleAuth(['admin'])], async (req, res) => {
    try {

        const newPlace = new Place(req.body);
        const place = await newPlace.save();
        res.json(place);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/places/:id
// @desc    Update a place (Admin only)
router.put('/:id', [auth, roleAuth(['admin'])], async (req, res) => {
    try {

        let place = await Place.findById(req.params.id);
        if (!place) return res.status(404).json({ msg: 'Place not found' });

        place = await Place.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.json(place);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/places/:id
// @desc    Delete a place (Admin only)
router.delete('/:id', [auth, roleAuth(['admin'])], async (req, res) => {
    try {

        const place = await Place.findById(req.params.id);
        if (!place) return res.status(404).json({ msg: 'Place not found' });

        await Place.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Place removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Place not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
