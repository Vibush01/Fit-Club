const express = require('express');
     const cors = require('cors');
     const connectDB = require('./config/db');
     require('dotenv').config();

     const app = express();

     // Connect to MongoDB
     connectDB();

     // Middleware
     app.use(cors());
     app.use(express.json());

     // Routes
     app.use('/api/auth', require('./routes/auth'));
     app.use('/api/admin', require('./routes/admin'));
     app.use('/api/owner', require('./routes/owner'));
     app.use('/api/trainer', require('./routes/trainer'));
     app.use('/api/customer', require('./routes/customer'));

     // Basic Route
     app.get('/', (req, res) => {
       res.send('Fitness Website Backend Running');
     });

     // Start Server
     const PORT = process.env.PORT || 5000;
     app.listen(PORT, () => console.log(`Server running on port ${PORT}`));