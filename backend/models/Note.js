const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  title: String,
  content: String,
  userId: String,
  shareId: { type: String, unique: true, sparse: true }

});

module.exports = mongoose.model('Note', NoteSchema);