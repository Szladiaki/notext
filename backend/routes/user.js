const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
const path = require('path')
const fs  = require('fs')
const { uuid } = require('uuidv4');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, uuid() + ext); // pl. szladiaki.jpg
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

const upload = multer({ storage });

// PUT /api/users/profile-pic (fájlfeltöltés)
router.put('/profile-pic', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const imageUrl = `/api/uploads/${req.file.filename}`;
    await User.updateOne(
      { username: req.username },
      { profilePic: imageUrl }
    );
    res.json({ profilePic: imageUrl });
  } catch (e) {
    console.error(e);
    res.status(500).send("Nem sikerült menteni a képet");
  }
});

module.exports = router;
