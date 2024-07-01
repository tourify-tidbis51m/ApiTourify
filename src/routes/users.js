const express = require("express");
const userSchema = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/login", async (req, res) => {
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
  res.header("Authorization", token).json({ token });
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
  if (!validPassword) return res.status(400).json({ message: "INCORRECT PASSWORD" });

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
    .select("name image role") // Seleccionar solo los campos deseados
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});


//GET NAME, ROLE, IMAGE OF THE USER (YOU NEED THIS ONE FOR ALL THE PAGES)
router.get("/user/:id", auth, (req, res) => {
  const { id } = req.params;
  userSchema
    .findById(id)
    .select("name image role") // Seleccionar solo los campos deseados
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

router.get("/getAchievements/:id", auth, (req, res) => {
  const { id } = req.params;
  userSchema
    .findById(id)
    .select("achievements") // Seleccionar solo los campos deseados
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});


module.exports = router;
