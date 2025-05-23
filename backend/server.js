const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const userRoutes = require('./routes/user');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API útvonalak
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/users', userRoutes);

// Fájlok kiszolgálása (pl. profilképek)
app.use('/api/uploads', express.static('uploads'));

// 🔧 Statikus frontend fájlok (pl. index.html, share.html stb.)
app.use(express.static(path.join(__dirname, '../frontend')));

// 🔗 Megosztott jegyzet oldal (pl. /share.html?id=xyz)
app.get('/share.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/share.html'));
});

// 🔧 Végül: szerver és adatbázis indítás
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/notext';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
