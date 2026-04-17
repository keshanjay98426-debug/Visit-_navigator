const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Review = require('../models/Review');
const Place = require('../models/Place');
const User = require('../models/User');


router.get('/:placeId', async (req, res) => {
    try {
        const reviews = await Review.find({ placeId: req.params.placeId }).populate('userId', 'username');
        res.json(reviews);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


router.get('/', async (req, res) => {
    try {
        const reviews = await Review.find();
        res.json(reviews);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


router.post('/:placeId', async (req, res) => {
    try {
        const { rating, comment, reviewerName } = req.body;
        const placeId = req.params.placeId;

       
        
        let userId = null;
        let name = reviewerName || 'Anonymous Traveler';

        

        const newReview = new Review({
            userId: null, 
            reviewerName: name,
            placeId: placeId,
            rating,
            comment
        });

        const review = await newReview.save();

        
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
