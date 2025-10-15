// Backend/models/User.js
const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['client', 'freelancer'], 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Export the model
module.exports = mongoose.model('User', userSchema);
