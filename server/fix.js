const mongoose = require('mongoose');
const Place = require('./models/Place');
const Review = require('./models/Review');

require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const reviews = await Review.find();
  console.log('Total Reviews:', reviews.length);
  const places = await Place.find();
  console.log('Total Places:', places.length);
  for (let place of places) {
    const placeReviews = reviews.filter(r => r.placeId.toString() === place._id.toString());
    let avgRating = 0;
    let reviewCount = placeReviews.length;
    if (reviewCount > 0) {
      avgRating = placeReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount;
    }
    
    if (reviewCount === 0) {
       avgRating = 0;
       reviewCount = 0; 
    }

    await Place.findByIdAndUpdate(place._id, {
      averageRating: avgRating.toFixed(1),
      reviewCount: reviewCount
    });
    console.log('Updated place ' + place.name + ': ' + avgRating.toFixed(1) + ' (' + reviewCount + ' reviews)');
  }
  console.log('Done mapping.');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
