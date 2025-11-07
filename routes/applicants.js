const express = require("express");
const router = express.Router();
const Applicants = require("../Models/applicant");

router.put("/accept/:id", async (req, res) => {
  try {
    const applicant = await Applicant.findById(req.params.id);
    if (!applicant)
      return res.status(404).json({ message: "Applicant not found" });

    applicant.status = "accepted";
    await applicant.save();

    res.json({ message: "Applicant accepted successfully", applicant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// routes/applicants.js
router.put("/complete/:id", async (req, res) => {
  try {
    const applicant = await Applicant.findById(req.params.id);
    if (!applicant) return res.status(404).json({ message: "Applicant not found" });

    applicant.status = "completed";
    await applicant.save();

    // Reject all other applicants for that gig
    await Applicant.updateMany(
      { gigId: applicant.gigId, _id: { $ne: applicant._id } },
      { status: "rejected" }
    );

    res.json({ message: "Job completed. Other applicants rejected." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
