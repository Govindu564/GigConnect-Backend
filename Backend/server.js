// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/gigconnect', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Simple route
app.get('/', (req, res) => {
  res.send('Server is running successfully 🚀');
});

// Start server
const PORT = 3000;
const gigRoutes = require('./routes/gig');
app.use('/api/gigs', gigRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

});
