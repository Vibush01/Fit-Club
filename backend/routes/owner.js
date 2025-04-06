const express = require('express');
  const router = express.Router();
  const auth = require('../middleware/auth');
  const User = require('../models/User');
  const Gym = require('../models/Gym');
  const { createNotification } = require('./notifications');

  // Middleware to restrict to owner role
  const ownerOnly = (req, res, next) => {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Access denied: Owners only' });
    }
    next();
  };

  // Create a Gym
  router.post('/gyms', auth, ownerOnly, async (req, res) => {
    const { name, location, images } = req.body;
    try {
      const gym = new Gym({
        ownerId: req.user.id,
        name,
        location,
        images: images || [],
      });
      await gym.save();
      res.status(201).json(gym);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get All Gyms Owned by the Owner
  router.get('/gyms', auth, ownerOnly, async (req, res) => {
    try {
      const gyms = await Gym.find({ ownerId: req.user.id });
      res.json(gyms);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update a Gym
  router.put('/gyms/:gymId', auth, ownerOnly, async (req, res) => {
    const { gymId } = req.params;
    const { name, location, images } = req.body;
    try {
      const gym = await Gym.findOne({ _id: gymId, ownerId: req.user.id });
      if (!gym) {
        return res.status(404).json({ error: 'Gym not found or you are not the owner' });
      }
      gym.name = name || gym.name;
      gym.location = location || gym.location;
      gym.images = images || gym.images;
      await gym.save();
      res.json(gym);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete a Gym
  router.delete('/gyms/:gymId', auth, ownerOnly, async (req, res) => {
    const { gymId } = req.params;
    try {
      const gym = await Gym.findOneAndDelete({ _id: gymId, ownerId: req.user.id });
      if (!gym) {
        return res.status(404).json({ error: 'Gym not found or you are not the owner' });
      }
      // Remove gymId from associated users
      await User.updateMany({ gymId }, { $unset: { gymId: '' } });
      res.json({ message: 'Gym deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Add a Trainer to a Gym
  router.post('/gyms/trainers', auth, ownerOnly, async (req, res) => {
    const { trainerEmail } = req.body;
    try {
      const trainer = await User.findOne({ email: trainerEmail, role: 'trainer' });
      if (!trainer) {
        return res.status(404).json({ error: 'Trainer not found' });
      }
      const gym = await Gym.findOne({ ownerId: req.user.id });
      if (!gym) {
        return res.status(404).json({ error: 'Gym not found' });
      }
      trainer.gymId = gym._id;
      await trainer.save();
      // Send notification to the trainer
      await createNotification(trainer._id, `You have been added to ${gym.name} as a trainer.`, 'info');
      res.json({ message: 'Trainer added to gym' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Remove a Trainer from a Gym
  router.delete('/gyms/trainers/:trainerId', auth, ownerOnly, async (req, res) => {
    const { trainerId } = req.params;
    try {
      const trainer = await User.findOne({ _id: trainerId, role: 'trainer' });
      if (!trainer) {
        return res.status(404).json({ error: 'Trainer not found' });
      }
      const gym = await Gym.findOne({ ownerId: req.user.id });
      if (!gym) {
        return res.status(404).json({ error: 'Gym not found' });
      }
      if (trainer.gymId?.toString() !== gym._id.toString()) {
        return res.status(400).json({ error: 'Trainer is not in your gym' });
      }
      trainer.gymId = undefined;
      await trainer.save();
      // Send notification to the trainer
      await createNotification(trainer._id, `You have been removed from ${gym.name}.`, 'info');
      res.json({ message: 'Trainer removed from gym' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Add a Member to a Gym
  router.post('/gyms/members', auth, ownerOnly, async (req, res) => {
    const { memberEmail } = req.body;
    try {
      const member = await User.findOne({ email: memberEmail, role: 'customer' });
      if (!member) {
        return res.status(404).json({ error: 'Member not found' });
      }
      const gym = await Gym.findOne({ ownerId: req.user.id });
      if (!gym) {
        return res.status(404).json({ error: 'Gym not found' });
      }
      member.gymId = gym._id;
      await member.save();
      // Send notification to the member
      await createNotification(member._id, `You have been added to ${gym.name} as a member.`, 'info');
      res.json({ message: 'Member added to gym' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Remove a Member from a Gym
  router.delete('/gyms/members/:memberId', auth, ownerOnly, async (req, res) => {
    const { memberId } = req.params;
    try {
      const member = await User.findOne({ _id: memberId, role: 'customer' });
      if (!member) {
        return res.status(404).json({ error: 'Member not found' });
      }
      const gym = await Gym.findOne({ ownerId: req.user.id });
      if (!gym) {
        return res.status(404).json({ error: 'Gym not found' });
      }
      if (member.gymId?.toString() !== gym._id.toString()) {
        return res.status(400).json({ error: 'Member is not in your gym' });
      }
      member.gymId = undefined;
      await member.save();
      // Send notification to the member
      await createNotification(member._id, `You have been removed from ${gym.name}.`, 'info');
      res.json({ message: 'Member removed from gym' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get All Trainers in a Gym
  router.get('/gyms/trainers', auth, ownerOnly, async (req, res) => {
    try {
      const gym = await Gym.findOne({ ownerId: req.user.id });
      if (!gym) {
        return res.status(404).json({ error: 'Gym not found' });
      }
      const trainers = await User.find({ gymId: gym._id, role: 'trainer' }).select('name email');
      res.json(trainers);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get All Members in a Gym
  router.get('/gyms/members', auth, ownerOnly, async (req, res) => {
    try {
      const gym = await Gym.findOne({ ownerId: req.user.id });
      if (!gym) {
        return res.status(404).json({ error: 'Gym not found' });
      }
      const members = await User.find({ gymId: gym._id, role: 'customer' }).select('name email');
      res.json(members);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  module.exports = router;