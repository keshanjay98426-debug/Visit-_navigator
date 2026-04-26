// Import required packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import route handlers
const authRoutes = require('./routes/authRoutes');
const placeRoutes = require('./routes/placeRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');

// Import admin seeder
const seedAdmin = require('./utils/seeder');

// Import express app
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to MongoDB database
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected to Visit Navigator DB');
    await seedAdmin();
  })
  .catch(err => console.log('MongoDB Connection Error:', err));


app.get('/', (req, res) => {
  res.json({ message: 'Visit Navigator API is running!', timestamp: new Date() });
});
// Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);


app.get('/', (req, res) => {
  res.json({ 
    message: 'Visit Navigator API is ONLINE', 
    timestamp: new Date(),
    endpoints: ['/api/auth', '/api/places', '/api/categories', '/api/reviews']
  });
});

// Handle undefined routes
app.use((req, res) => {
  console.log(`[404] ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route Not Found', 
    method: req.method, 
    path: req.originalUrl,
    hint: 'Check if you are using the correct prefix (e.g., /api/categories)'
  });
});

// Set server port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
