const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePic: String // base64-es kép vagy URL
});

module.exports = mongoose.model('User', userSchema);
