const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
},
  category: { 
    type: mongoose.
    Schema.Types.ObjectId, 
    ref: 'Category',
    required: true
  },
  description: { 
    type: String, 
    required: true },
    location: {
        latitude: { 
            type: Number, 
            required: true },
        longitude: { 
            type: Number, 
            required: true 
        }
  },
  distance: { 
    type: Number, 
    required: true 
}, 
  openingHours: { 
    type: String, 
    required: function() { return !this.is24Hours; } },
  closingTimes: { 
    type: String, required: function() { return !this.is24Hours; } },
  is24Hours: { 
    type: Boolean, 
    default: false },
  images: {
    type: [String],
    validate: [arrayLimit, '{PATH} exceeds the limit of 10']
  },
  tips: { 
    type: String 
},
  averageRating: { 
    type: Number, 
    default: 0 
},
  reviewCount: { 
    type: Number, 
    default: 0 }
}, { timestamps: true });

function arrayLimit(val) {
  return val.length <= 10;
}

module.exports = mongoose.model('Place', placeSchema);