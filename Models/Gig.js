const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number, required: true },
  location: { type: String, required: true },
  skills: { type: [String], required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
acceptedFreelancerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null   
  },
  roomId: { 
    type: String, 
    default: null   
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Gig', gigSchema);
