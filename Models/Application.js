
const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  gigId: { type: mongoose.Schema.Types.ObjectId, ref: "Gig", required: true },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  coverLetter: { type: String },
  experience: String,
  skillsOffered: [String],
  portfolioLink: String,
  status: {
    type: String,
    // enum: ["pending", "accepted", "rejected", "in_discussion", "completed"],
    enum: ["applied", "in_touch", "rejected"],
    default: "applied",
  },
  roomId: { type: String },
  appliedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Application", applicationSchema);
