const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  questions: [
    {
      question: String,
      answer: String
    }
  ]
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
  objetos: [
    {
      id_objeto: String,
      name: String,
      description: String,
      model: String,
      tipo: String
    }
  ],
  game: gameSchema,
  date_start: String,
  date_end: String
});

module.exports = mongoose.model('Location', locationSchema);
