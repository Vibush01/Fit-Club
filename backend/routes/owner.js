const express = require('express');
     const router = express.Router();
     const auth = require('../middleware/auth');
     const Gym = require('../models/Gym');
     const User = require('../models/User');

     // Middleware to restrict to owner role
     const ownerOnly = (req, res, next) => {
       if (req.user.role !== 'owner') {
         return res.status(403).json({ error: 'Access denied: Owners only' });
       }
       next();
     };

     // Register a Gym
     router.post('/gyms', auth, ownerOnly, async (req, res) => {
       const { name, location, images } = req.body;
       try {
         const gym = new Gym({
           name,
           location,
           ownerId: req.user.id,
           images: images || [],
         });
         await gym.save();
         // Update owner's gymId
         await User.findByIdAndUpdate(req.user.id, { gymId: gym._id });
         res.status(201).json(gym);
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });

     // Add a Trainer to the Gym
     router.post('/gyms/trainers', auth, ownerOnly, async (req, res) => {
       const { trainerEmail } = req.body;
       try {
         // Find the owner and their gym
         const owner = await User.findById(req.user.id);
         if (!owner.gymId) {
           return res.status(400).json({ error: 'Owner does not have a gym' });
         }
         const gym = await Gym.findById(owner.gymId);
         if (!gym) {
           return res.status(404).json({ error: 'Gym not found' });
         }

         // Find the trainer
         const trainer = await User.findOne({ email: trainerEmail, role: 'trainer' });
         if (!trainer) {
           return res.status(404).json({ error: 'Trainer not found' });
         }

         // Add trainer to gym
         if (!gym.trainerIds.includes(trainer._id)) {
           gym.trainerIds.push(trainer._id);
           await gym.save();
           // Update trainer's gymId
           await User.findByIdAndUpdate(trainer._id, { gymId: gym._id });
         }

         res.json({ message: 'Trainer added to gym', gym });
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });

     // Remove a Trainer from the Gym
     router.delete('/gyms/trainers/:trainerId', auth, ownerOnly, async (req, res) => {
       try {
         const owner = await User.findById(req.user.id);
         if (!owner.gymId) {
           return res.status(400).json({ error: 'Owner does not have a gym' });
         }
         const gym = await Gym.findById(owner.gymId);
         if (!gym) {
           return res.status(404).json({ error: 'Gym not found' });
         }

         // Remove trainer from gym
         gym.trainerIds = gym.trainerIds.filter(id => id.toString() !== req.params.trainerId);
         await gym.save();

         // Remove gymId from trainer
         await User.findByIdAndUpdate(req.params.trainerId, { gymId: null });

         res.json({ message: 'Trainer removed from gym', gym });
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });

     // Add a Member to the Gym
     router.post('/gyms/members', auth, ownerOnly, async (req, res) => {
       const { memberEmail } = req.body;
       try {
         const owner = await User.findById(req.user.id);
         if (!owner.gymId) {
           return res.status(400).json({ error: 'Owner does not have a gym' });
         }
         const gym = await Gym.findById(owner.gymId);
         if (!gym) {
           return res.status(404).json({ error: 'Gym not found' });
         }

         // Find the member
         const member = await User.findOne({ email: memberEmail, role: 'customer' });
         if (!member) {
           return res.status(404).json({ error: 'Member not found' });
         }

         // Add member to gym
         if (!gym.memberIds.includes(member._id)) {
           gym.memberIds.push(member._id);
           await gym.save();
           // Update member's gymId
           await User.findByIdAndUpdate(member._id, { gymId: gym._id });
         }

         res.json({ message: 'Member added to gym', gym });
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });

     // Remove a Member from the Gym
     router.delete('/gyms/members/:memberId', auth, ownerOnly, async (req, res) => {
       try {
         const owner = await User.findById(req.user.id);
         if (!owner.gymId) {
           return res.status(400).json({ error: 'Owner does not have a gym' });
         }
         const gym = await Gym.findById(owner.gymId);
         if (!gym) {
           return res.status(404).json({ error: 'Gym not found' });
         }

         // Remove member from gym
         gym.memberIds = gym.memberIds.filter(id => id.toString() !== req.params.memberId);
         await gym.save();

         // Remove gymId from member
         await User.findByIdAndUpdate(req.params.memberId, { gymId: null });

         res.json({ message: 'Member removed from gym', gym });
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });

     // Get Gym Details (Owner's Gym)
     router.get('/gyms', auth, ownerOnly, async (req, res) => {
       try {
         const owner = await User.findById(req.user.id);
         if (!owner.gymId) {
           return res.status(400).json({ error: 'Owner does not have a gym' });
         }
         const gym = await Gym.findById(owner.gymId)
           .populate('trainerIds', 'name email')
           .populate('memberIds', 'name email');
         if (!gym) {
           return res.status(404).json({ error: 'Gym not found' });
         }
         res.json(gym);
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });

     module.exports = router;