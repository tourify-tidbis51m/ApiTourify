const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  questions: [
    {
      question: String,
      answer: String,
    },
  ],
});

const locationSchema = new mongoose.Schema({
  name: String,
  coordinate: String,
  description: String,
  year: String,
  urlvideo: String,
  image: String,
  pintype: String,
  loctype: String,
  model: String,
  modules: [
    {
      id_module: String,
      name: String,
      model: String,
    },
  ],
  game: gameSchema,
  date: String,
  time: String,
});

module.exports = mongoose.model("Location", locationSchema);
