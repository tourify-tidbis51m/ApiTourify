const express = require("express");
const userSchema = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const cloudinary = require("../../config/cloudinaryConfig");

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await userSchema.findOne({ email });
  if (!user) return res.status(400).json({ message: "EMAIL NOT FOUND" });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword)
    return res.status(400).json({ message: "INCORRECT PASSWORD" });

  const token = jwt.sign(
    { _id: user._id },
    process.env.SECRET,
    { expiresIn: "20h" }
  );
  res.header("Authorization", token).json({token, id: user._id, role: user.role, name: user.name, email: user.email, image: user.image, country: user.country});
});

//REGISTER MOBILE
router.post("/registermobile", async (req, res) => {
  try {
    const user = new userSchema(req.body);
    const savedUser = await user.save();

    const token = jwt.sign(
      { _id: savedUser._id },
      process.env.SECRET,
      { expiresIn: "20h" }
    );

    res.json({
      token,
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      image: "https://res.cloudinary.com/dnfonffpd/image/upload/v1721190630/user_v3pvmm.png",
      country: "México",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//CREATE USER
router.post("/", (req, res) => {
  const user = userSchema(req.body);
  user
    .save()
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

//ACTUALIZAR UN USUARIO
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, age, email } = req.body;
  userSchema
    .updateOne({ _id: id }, { $set: { name, age, email } })
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

//ELIMINAR UN USUARIO
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  userSchema
    .deleteOne({ _id: id })
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

//END POINTS FOR TESTING

//GET USER
router.get("/:id", (req, res) => {
  const { id } = req.params;
  userSchema
    .findById(id)
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

//GET USERS (JUST FOR TEST)
router.get("/", (req, res) => {
  userSchema
    .find()
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

//----------------------------LAS QUE ESTOY USANDO PARA LA WEB-----------------------------

//CHECK WITH USER AND PASSWORD
router.post("/checkUser", async (req, res) => {
  const { email, password } = req.body;

  const user = await userSchema.findOne({ email });
  if (!user) return res.status(400).json({ message: "EMAIL NOT FOUND" });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword)
    return res.status(400).json({ message: "INCORRECT PASSWORD" });

  const token = jwt.sign(
    { _id: user._id, role: user.role },
    process.env.SECRET,
    { expiresIn: "1h" }
  );
  res.header("Authorization", token).json({ token, user });
});

//GET NAME, ROLE, IMAGE OF THE USER (YOU NEED THIS ONE FOR ALL THE PAGES)
router.get("/user/:id", auth, (req, res) => {
  const { id } = req.params;
  userSchema
    .findById(id)
    .select("name image role")
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

router.get("/getAchievements/:id", auth, (req, res) => {
  const { id } = req.params;
  userSchema
    .findById(id)
    .select("achievements")
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

router.get("/editprofile/:id", auth, (req, res) => {
  const { id } = req.params;
  userSchema
    .findById(id)
    .select("name image role email country")
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

//ELIMINAR UN USUARIO
router.delete("/deleteprofile/:id", auth, (req, res) => {
  const { id } = req.params;
  userSchema
    .deleteOne({ _id: id })
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

router.get("/admin/getcomments", (req, res) => {
  userSchema
    .aggregate([
      { $unwind: "$comments" },
      { $match: { "comments.description": { $ne: "" } } },
      { $project: { _id: 0, description: "$comments.description", email: 1 } },
    ])
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

router.put("/editprofile/:id", upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const newUser = req.body;

  if (req.file) {
    try {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        });
        uploadStream.end(req.file.buffer);
      });
      newUser.image = result.secure_url;
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  if (newUser.password) {
    newUser.password = await bcrypt.hash(newUser.password, 8);
  }

  userSchema.updateOne({ _id: id }, { $set: newUser })
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});


router.put("/user/sendcomment/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    const user = await userSchema.findOne({ _id: id });
    const comment = {
      description,
    };
    user.comments.push(comment);
    await userSchema.updateOne(
      { _id: id },
      { $set: { comments: user.comments } }
    );
    res.json({ message: "Transacción realizada con éxito" });
  } catch (error) {
    res.json({ message: error });
  }
});

router.post("/createuser", (req, res) => {
  const user = userSchema(req.body);
  
  user
    .save()
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

router.get("/mymodels/:id", auth, async (req, res) => {
  try {
    const models = await userSchema.findById(req.params.id).select("models");
    res.json(models);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/giveAchievement/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { id_achievement } = req.body;
    const user = await userSchema.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.achievements.push({ id_achievement: id_achievement });
    
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/unlockmodel", async (req, res) => {
  try {
    const { id_card, id_module } = req.body;
    console.log(id_card);
    console.log(id_module)
    const user = await userSchema.findOne({id_card: id_card});
    console.log(user)
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.models.some(m => m.model === id_module)) {
      return res.status(400).json({ message: 'Model already added' });
    }
    user.models.push({ id_module: id_module });
    await user.save();
    res.json("Model added successfully");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/addCard", auth, async (req, res) => {
  try {
    const { id_card, email } = req.body;
    const user = await userSchema.findOne({email: email});
    if (!user) {
      return res.status(404).json({ message: 'Email no encontrado' });
    }
    const existingCard = await userSchema.findOne({
      id_card: id_card
    });
    if (existingCard) {
      await userSchema.updateOne(
        { _id: existingCard._id },
        { $unset: { id_card: "" } }
      );
    }
    user.id_card = id_card
    await user.save();
    res.json({ message: 'Tarjeta agregada correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/checkEmail", async (req, res) => {
  const { email } = req.body;
  const user = await userSchema.findOne({ email });
  if (user) {
    return res.status(400).json({ message: 'Email ya registrado' });
  }
  res.json({ message: 'Email disponible' });
});

module.exports = router;
