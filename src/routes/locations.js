const express = require("express");
const router = express.Router();
const locationSchema = require("../models/location");
const auth = require("../middleware/auth");

// Obtener todas las locations
router.get("/", async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get("/events", auth, async (req, res) => {
  try {
    const data = await locationSchema.find({ pintype: "event" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/all", auth, async (req, res) => {
  try {
    const data = await locationSchema.find().select('_id name coordinate description image pintype loctype');
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/historical/:_id", auth, async (req, res) => {
  try {
    const data = await locationSchema.findById(req.params._id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
