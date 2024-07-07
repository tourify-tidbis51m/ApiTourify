const express = require("express");
const router = express.Router();
const locationSchema = require("../models/location");
const auth = require("../middleware/auth");

// Obtener todas las locations
router.get("/", auth, async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (err) {
    res.status(500).json({ message: err.message });
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

router.get("/events", auth, async (req, res) => {
  try {
    const data = await locationSchema.find({ pintype: "event" });
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

router.get("/model/:_id", auth, async (req, res) => {
  try {
    const data = await locationSchema.findById(req.params._id).select('_id model');
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/locations-short", auth, async (req, res) => {
  try {
    const data = await locationSchema.find({pintype: "historical"}).select('name image'); 
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/addlocation", auth, async (req, res) => {
  try {
    const location = new locationSchema(req.body);
    const data = await location.save();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/deletelocation/:id", auth, (req, res) => {
  const { id } = req.params;
  locationSchema
    .deleteOne({ _id: id })
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

module.exports = router;
