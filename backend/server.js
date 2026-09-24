require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const destinationRoutes = require('./routes/destinations');
const transportRoutes = require('./routes/transport');
const tripRoutes = require('./routes/trips');
const favoriteRoutes = require('./routes/favorites');
const aiRoutes = require('./routes/ai');
const logRoutes = require('./routes/logs');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/logs', logRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
