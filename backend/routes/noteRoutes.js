const express = require('express');
const Note = require('../models/Note');
const router = express.Router();

router.get('/', async (req, res) => {
  const notes = await Note.find({ userId: req.userId });
  res.json(notes);
});

router.post('/', async (req, res) => {
  const { title, content } = req.body;
  const note = await Note.create({ title, content, userId: req.userId });
  res.status(201).json(note);
});

router.put('/:id', async (req, res) => {
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true }
  );
  if (!note) return res.status(404).json({ error: 'Not found' });
  res.json(note);
});

router.delete('/:id', async (req, res) => {
  const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!note) return res.status(404).json({ error: 'Not found' });
  res.sendStatus(204);
});

module.exports = router;