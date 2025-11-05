const express = require("express");
const router = express.Router();
const Gig = require("../models/Gig");
const Application = require("../models/Application");

// 1. Get all gigs (for freelancers)

router.get("/", async (req, res) => {
  try {
    const gigs = await Gig.find();
    res.json(gigs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2️. Post a new gig (for clients)

router.post("/", async (req, res) => {
  try {
    const { title, description, budget, location, skills, clientId } = req.body;

    if (
      !title ||
      !description ||
      !budget ||
      !location ||
      !skills ||
      !clientId
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newGig = new Gig({
      title,
      description,
      budget,
      location,
      skills,
      clientId,
    });

    await newGig.save();
    res
      .status(201)
      .json({ message: "✅ Gig posted successfully", gig: newGig });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3️. Apply for a gig (for freelancers)
router.post("/:id/apply", async (req, res) => {
  const gigId = req.params.id;

  try {
    const {
      freelancerId,
      coverLetter,
      experience,
      skillsOffered,
      portfolioLink,
    } = req.body;

    if (!freelancerId || !gigId) {
      return res.status(400).json({ message: "Missing freelancerId or gigId" });
    }

    // ✅ Fetch gig first to get clientId
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    // Check if already applied
    const existing = await Application.findOne({ gigId, freelancerId });
    if (existing) {
      return res.status(400).json({ message: "Already applied for this gig." });
    }

    // ✅ Create new application including clientId
    const newApplication = new Application({
      gigId,
      freelancerId,
      clientId: gig.clientId, // ✅ now gig is defined
      coverLetter,
      experience,
      skillsOffered,
      portfolioLink,
      status: "applied",
    });

    await newApplication.save();

    res.status(201).json({
      message: "Application submitted successfully!",
      application: newApplication,
    });
  } catch (err) {
    console.error("❌ Error in /apply route:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/freelancer/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const applications = await Application.find({ freelancerId: id })
      .populate("gigId")
      .populate("clientId", "username email")
      .populate("freelancerId");
    // .populate({
    //   path: "gigId",
    //   populate: { path: "clientId", select: "username email" }, // ✅ get client info
    // })

    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4️. Get all applicants for a gig (for client)

router.get("/:id/applicants", async (req, res) => {
  try {
    const applications = await Application.find({
      gigId: req.params.id,
    }).populate("freelancerId", "username email role");
    res.json(applications);
  } catch (err) {
    console.error("Error fetching applicants:", err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Accept a freelancer (for client)

router.post("/:gigId/accept", async (req, res) => {
  try {
    const { gigId } = req.params;
    const { freelancerId } = req.body;
    const rejectOthers = req.query.rejectOthers === "true";

    if (!freelancerId) {
      return res.status(400).json({ message: "Missing freelancerId" });
    }

    const application = await Application.findOne({ gigId, freelancerId });
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // const roomId = `${gigId}_${freelancerId}`;
    const roomId =
      application.roomId ||
      `${gigId}_${freelancerId}_${Date.now().toString(36)}`;

    application.status = "accepted";
    application.roomId = roomId;
    await application.save();

    await Gig.findByIdAndUpdate(
      gigId,
      { acceptedFreelancerId: freelancerId, roomId },
      { new: true }
    );

    // If caller explicitly wants others auto-rejected:
    if (rejectOthers) {
      await Application.updateMany(
        { gigId, freelancerId: { $ne: freelancerId } },
        { status: "rejected" }
      );
    }

    res.json({
      message: "Freelancer accepted successfully!",
      roomId,
      application,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Server error while accepting freelancer" });
  }
});

router.post("/:gigId/complete", async (req, res) => {
  try {
    const { gigId } = req.params;
    const { freelancerId } = req.body;
    const application = await Application.findOne({ gigId, freelancerId });
    if (!application)
      return res.status(404).json({ message: "Application not found" });

    application.status = "completed";
    await application.save();

    // Reject all remaining pending/in_discussion applicants
    await Application.updateMany(
      {
        gigId,
        freelancerId: { $ne: freelancerId },
        status: { $in: ["pending", "in_discussion"] },
      },
      { status: "rejected" }
    );

    res.json({ message: "Job completed and others rejected." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark freelancer as "in_touch" (creates chat room if not exists)
router.put("/:gigId/in_touch", async (req, res) => {
  try {
    const { gigId } = req.params;
    const { freelancerId } = req.body;

    if (!freelancerId) {
      return res.status(400).json({ message: "Missing freelancerId" });
    }

    let application = await Application.findOne({ gigId, freelancerId });
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const roomId =
      application.roomId ||
      `${gigId}_${freelancerId}_${Date.now().toString(36)}`;

    application.status = "in_touch";
    application.roomId = roomId;
    await application.save();

    res.json({ message: "Freelancer marked as in_touch", application });
  } catch (err) {
    console.error("Error marking in_touch:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE gig by ID
router.delete("/:id", async (req, res) => {
  try {
    const gigId = req.params.id;
    const deletedGig = await Gig.findByIdAndDelete(gigId);

    if (!deletedGig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    res.json({ message: "Gig deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting gig:", error);
    res.status(500).json({ message: "Server error deleting gig" });
  }
});

// DELETE all gigs (use carefully!)
router.delete("/delete/all", async (req, res) => {
  try {
    await Gig.deleteMany({});
    res.json({ message: "✅ All gigs deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting gigs:", error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
