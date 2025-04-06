const express = require('express');
     const router = express.Router();
     const bcrypt = require('bcryptjs');
     const jwt = require('jsonwebtoken');
     const User = require('../models/User');

     // Signup Route
     router.post('/signup', async (req, res) => {
       const { email, password, role, name } = req.body;

       try {
         // Check if user exists
         let user = await User.findOne({ email });
         if (user) {
           return res.status(400).json({ error: 'User already exists' });
         }

         // Hash password
         const salt = await bcrypt.genSalt(10);
         const hashedPassword = await bcrypt.hash(password, salt);

         // Create new user
         user = new User({
           email,
           password: hashedPassword,
           role,
           name,
         });
         await user.save();

         // Generate JWT
         const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
           expiresIn: '1h',
         });

         res.status(201).json({ token, user: { id: user._id, email, role, name } });
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });

     // Login Route
     router.post('/login', async (req, res) => {
       const { email, password } = req.body;

       try {
         // Check if user exists
         const user = await User.findOne({ email });
         if (!user) {
           return res.status(400).json({ error: 'Invalid credentials' });
         }

         // Compare password
         const isMatch = await bcrypt.compare(password, user.password);
         if (!isMatch) {
           return res.status(400).json({ error: 'Invalid credentials' });
         }

         // Generate JWT
         const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
           expiresIn: '1h',
         });

         res.json({ token, user: { id: user._id, email, role: user.role, name: user.name } });
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });

     module.exports = router;