const express = require('express');
  const cors = require('cors');
  const connectDB = require('./config/db');
  const authRoutes = require('./routes/auth');
  const adminRoutes = require('./routes/admin');
  const ownerRoutes = require('./routes/owner');
  const trainerRoutes = require('./routes/trainer');
  const customerRoutes = require('./routes/customer');
  const notificationRoutes = require('./routes/notifications');
  require('dotenv').config(); // Load environment variables from .env

  const app = express();

  // Connect to MongoDB
  connectDB();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/owner', ownerRoutes);
  app.use('/api/trainer', trainerRoutes);
  app.use('/api/customer', customerRoutes);
  app.use('/api/notifications', notificationRoutes);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));