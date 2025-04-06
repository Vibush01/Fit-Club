const express = require('express');
     const router = express.Router();
     const auth = require('../middleware/auth');
     const Gym = require('../models/Gym');
     const User = require('../models/User');
     const Membership = require('../models/Membership');

     // Middleware to restrict to admin role
     const adminOnly = (req, res, next) => {
       if (req.user.role !== 'admin') {
         return res.status(403).json({ error: 'Access denied: Admins only' });
       }
       next();
     };

     router.get('/dashboard', auth, adminOnly, async (req, res) => {
        try {
          const gymsCount = await Gym.countDocuments();
          const usersCount = await User.countDocuments();
          const subscriptionsCount = await Membership.countDocuments();
          res.json({ gymsCount, usersCount, subscriptionsCount });
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
      });

     // Get All Gyms
     router.get('/gyms', auth, adminOnly, async (req, res) => {
       try {
         const gyms = await Gym.find().populate('ownerId', 'name email');
         res.json(gyms);
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });

     // Delete a Gym
     router.delete('/gyms/:id', auth, adminOnly, async (req, res) => {
       try {
         const gym = await Gym.findByIdAndDelete(req.params.id);
         if (!gym) {
           return res.status(404).json({ error: 'Gym not found' });
         }
         res.json({ message: 'Gym deleted' });
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });

     // Get All Users
     router.get('/users', auth, adminOnly, async (req, res) => {
       try {
         const users = await User.find().select('-password');
         res.json(users);
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });

     // Delete a User
     router.delete('/users/:id', auth, adminOnly, async (req, res) => {
       try {
         const user = await User.findByIdAndDelete(req.params.id);
         if (!user) {
           return res.status(404).json({ error: 'User not found' });
         }
         res.json({ message: 'User deleted' });
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });

     router.post('/gyms', auth, adminOnly, async (req, res) => {
        const { name, location } = req.body;
        try {
          const gym = new Gym({
            name,
            location,
            ownerId: req.body.ownerId,
          });
          await gym.save();
          res.status(201).json(gym);
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
      });

     module.exports = router;