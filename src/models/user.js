const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const achievementSchema = new mongoose.Schema({
    id_achievement: String
  });
  
  const commentSchema = new mongoose.Schema({
    id_comment: String,
    type: String,
    description: String
  });
  
  const userSchema = new mongoose.Schema({
    name: String,
    country: String,
    email: String,
    password: String,
    image: String,
    role: String,
    achievements: [achievementSchema],
    comments: [commentSchema]
  });

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 8);
    }
    next();
  });

module.exports = mongoose.model('User', userSchema);