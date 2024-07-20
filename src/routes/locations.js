const express = require("express");
const router = express.Router();
const locationSchema = require("../models/location");
const auth = require("../middleware/auth");
const multer = require("multer");
const upload = multer();
const cloudinary = require("../../config/cloudinaryConfig");

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

router.post("/addlocation", auth, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'model', maxCount: 1 }]), async (req, res) => {
  try {
    const {
      name,
      coordinate,
      description,
      year,
      urlvideo,
      pintype,
      loctype,
    } = req.body;

    const uploadToCloudinary = (fileBuffer, resourceType = 'image') => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ resource_type: resourceType }, (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        });
        uploadStream.end(fileBuffer);
      });
    };

    const imageUrl = await uploadToCloudinary(req.files.image[0].buffer);
    const modelUrl = await uploadToCloudinary(req.files.model[0].buffer, 'auto');

    const location = new locationSchema({
      name,
      coordinate,
      description,
      year,
      urlvideo,
      image: imageUrl,
      pintype,
      loctype,
      model: modelUrl,
    });

    const data = await location.save();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/addrestaurant", auth, upload.single("imagerestaurant"), async (req, res) => {
  try {
    const { name, coordinate, description, pintype } = req.body;

    console.log(req.file);
    console.log(name, coordinate, description, pintype);


    const uploadToCloudinary = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ resource_type: "image" }, (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        });
        uploadStream.end(fileBuffer);
      });
    };

    let imageUrl = '';
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer);
    }

    const location = new locationSchema({
      name,
      coordinate,
      description,
      pintype,
      image: imageUrl,
    });

    const data = await location.save();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/addevent", auth, upload.single("imageevent"), async (req, res) => {
  try {
    const { name, coordinate, description, pintype, date, time } = req.body;

    const uploadToCloudinary = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ resource_type: "image" }, (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        });
        uploadStream.end(fileBuffer);
      });
    };

    let imageUrl = '';
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer);
    }

    const location = new locationSchema({
      name,
      coordinate,
      description,
      pintype,
      date,
      time,
      image: imageUrl,
    });

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

router.get("/questions/:_id", auth, async (req, res) => {
  try {
    const data = await locationSchema
      .findById(req.params._id)
      .select("game image name");
    console.log(data);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
