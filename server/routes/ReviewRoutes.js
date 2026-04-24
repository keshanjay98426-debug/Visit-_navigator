const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Review = require('../models/Review');
const Place = require('../models/Place');
const User = require('../models/User');

// @route   GET api/reviews/:placeId
// @desc    Get all reviews for a place
router.get('/:placeId', async (req, res) => {
    try {
        const reviews = await Review.find({ placeId: req.params.placeId }).populate('userId', 'username');
        res.json(reviews);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/reviews
// @desc    Get all reviews (for admin dashboard counting)
router.get('/', async (req, res) => {
    try {
        const reviews = await Review.find();
        res.json(reviews);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/reviews/:placeId
// @desc    Add a review to a place
router.post('/:placeId', async (req, res) => {
    try {
        const { rating, comment, reviewerName } = req.body;
        const placeId = req.params.placeId;

        // Check if user is logged in (optional auth)
        // If auth middleware was used, req.user would exist.
        // For simplicity, we'll check if a token was provided manually or just treat as anonymous if no user info.
        
        let userId = null;
        let name = reviewerName || 'Anonymous Traveler';

        // Optional: If we want to support both, we can check headers.
        // But for now, we'll just follow the "no login for travelers" requirement.

        const newReview = new Review({
            userId: null, // Always null for traveler portal anonymous reviews
            reviewerName: name,
            placeId: placeId,
            rating,
            comment
        });

        const review = await newReview.save();

        // Recalculate average rating for the place
        const reviews = await Review.find({ placeId: placeId });
        let avg = 0;
        if (reviews.length > 0) {
            avg = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
        }
        
        await Place.findByIdAndUpdate(placeId, {
            averageRating: avg.toFixed(1),
            reviewCount: reviews.length
        });

        res.json(review);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
