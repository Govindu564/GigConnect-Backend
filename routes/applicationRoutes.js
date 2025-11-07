// routes/applications.js
const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const Gig = require("../models/Gig");

router.get("/freelancer/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const applications = await Application.find({ freelancerId: id })
      .populate("freelancerId", "username email")
      .populate({
        path: "clientId",
        select: "username email",
      })
      .populate({
        path: "gigId",
        select: "title skills location clientId",
      });

    res.json(applications);
  } catch (err) {
    console.error("Error fetching freelancer applications:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/status", async (req, res) => {
  try {
    const { gigId, freelancerId, status } = req.body;

    let application = await Application.findOne({ gigId, freelancerId });
    if (!application)
      return res.status(404).json({ message: "Application not found" });

    application.status = status;

    if (status === "in_touch" && !application.roomId) {
      application.roomId = `${gigId}_${freelancerId}_${Date.now()}`;
    }

    await application.save();

    res.json({ message: "Status updated", application });
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
