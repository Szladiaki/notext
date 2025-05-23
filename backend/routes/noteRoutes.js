const express = require('express');
const crypto = require('crypto');
const Note = require('../models/Note');
const authenticate = require('../middleware/authenticate');
const router = express.Router();

// GET all notes for the authenticated user
router.get('/', authenticate, async (req, res) => {
  const notes = await Note.find({ userId: req.userId });
  res.json(notes);
});

// Create a new note
router.post('/', authenticate, async (req, res) => {
  const { title, content } = req.body;
  const note = await Note.create({ title, content, userId: req.userId });
  res.status(201).json(note);
});

// Update a note
router.put('/:id', authenticate, async (req, res) => {
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true }
  );
  if (!note) return res.status(404).json({ error: 'Not found' });
  res.json(note);
});

// Delete a note
router.delete('/:id', authenticate, async (req, res) => {
  const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!note) return res.status(404).json({ error: 'Not found' });
  res.sendStatus(204);
});

// Get a note by shareId (public access)
router.get('/share/:shareId', async (req, res) => {
  try {
    const note = await Note.findOne({ shareId: req.params.shareId });
    if (!note) return res.status(404).send("Nincs ilyen megosztott jegyzet.");
    res.json({
      title: note.title,
      content: note.content
    });
  } catch (e) {
    res.status(500).send("Hiba történt.");
  }
});

// Share a note (authenticated)
router.put('/:id/share', authenticate, async (req, res) => {
  try {
    const shareId = crypto.randomBytes(6).toString("base64url");

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { shareId },
      { new: true }
    );

    if (!note) return res.status(404).send("Nincs ilyen jegyzet vagy nem a tiéd.");

    res.json({ shareId });
  } catch (e) {
    console.error("Megosztás hiba:", e);
    res.status(500).send("Nem sikerült megosztani a jegyzetet.");
  }
});

module.exports = router;
