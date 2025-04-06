const express = require('express');
  const router = express.Router();
  const auth = require('../middleware/auth');
  const User = require('../models/User');
  const WorkoutPlan = require('../models/WorkoutPlan');
  const DietPlan = require('../models/DietPlan');
  const MacroLog = require('../models/MacroLog');
  const BodyProgress = require('../models/BodyProgress');

  // Middleware to restrict to customer role
  const customerOnly = (req, res, next) => {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ error: 'Access denied: Customers only' });
    }
    next();
  };

  // View Workout Plan
  router.get('/workout-plan', auth, customerOnly, async (req, res) => {
    try {
      const workoutPlan = await WorkoutPlan.findOne({ userId: req.user.id });
      if (!workoutPlan) {
        return res.status(404).json({ error: 'Workout plan not found' });
      }
      res.json(workoutPlan);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // View Diet Plan
  router.get('/diet-plan', auth, customerOnly, async (req, res) => {
    try {
      const dietPlan = await DietPlan.findOne({ userId: req.user.id });
      if (!dietPlan) {
        return res.status(404).json({ error: 'Diet plan not found' });
      }
      res.json(dietPlan);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create Macro Log
  router.post('/macro-log', auth, customerOnly, async (req, res) => {
    const { date, food, protein, carbs, fats, calories } = req.body;
    console.log('Received macro log payload:', req.body);
    try {
      const macroLog = new MacroLog({
        userId: req.user.id,
        date,
        food,
        protein,
        carbs,
        fats,
        calories,
      });
      await macroLog.save();
      console.log('Saved macro log:', macroLog);
      res.status(201).json(macroLog);
    } catch (err) {
      console.error('Macro log save error:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // Update Macro Log
  router.put('/macro-log/:id', auth, customerOnly, async (req, res) => {
    const { id } = req.params;
    const { date, food, protein, carbs, fats, calories } = req.body;
    try {
      const macroLog = await MacroLog.findOne({ _id: id, userId: req.user.id });
      if (!macroLog) {
        return res.status(404).json({ error: 'Macro log not found' });
      }
      macroLog.date = date;
      macroLog.food = food;
      macroLog.protein = protein;
      macroLog.carbs = carbs;
      macroLog.fats = fats;
      macroLog.calories = calories;
      await macroLog.save();
      res.json(macroLog);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete Macro Log
  router.delete('/macro-log/:id', auth, customerOnly, async (req, res) => {
    const { id } = req.params;
    try {
      const macroLog = await MacroLog.findOneAndDelete({ _id: id, userId: req.user.id });
      if (!macroLog) {
        return res.status(404).json({ error: 'Macro log not found' });
      }
      res.json({ message: 'Macro log deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // View Macro Logs
  router.get('/macro-logs', auth, customerOnly, async (req, res) => {
    try {
      const macroLogs = await MacroLog.find({ userId: req.user.id }).sort({ date: -1 });
      res.json(macroLogs);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create Body Progress
  router.post('/body-progress', auth, customerOnly, async (req, res) => {
    const { date, weight, bodyFat, muscleMass, images } = req.body;
    console.log('Received body progress payload:', req.body);
    try {
      const bodyProgress = new BodyProgress({
        userId: req.user.id,
        date,
        weight,
        bodyFat,
        muscleMass,
        images: images || [],
      });
      await bodyProgress.save();
      console.log('Saved body progress:', bodyProgress);
      res.status(201).json(bodyProgress);
    } catch (err) {
      console.error('Body progress save error:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // Update Body Progress
  router.put('/body-progress/:id', auth, customerOnly, async (req, res) => {
    const { id } = req.params;
    const { date, weight, bodyFat, muscleMass, images } = req.body;
    try {
      const bodyProgress = await BodyProgress.findOne({ _id: id, userId: req.user.id });
      if (!bodyProgress) {
        return res.status(404).json({ error: 'Body progress not found' });
      }
      bodyProgress.date = date;
      bodyProgress.weight = weight;
      bodyProgress.bodyFat = bodyFat;
      bodyProgress.muscleMass = muscleMass;
      bodyProgress.images = images || [];
      await bodyProgress.save();
      res.json(bodyProgress);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete Body Progress
  router.delete('/body-progress/:id', auth, customerOnly, async (req, res) => {
    const { id } = req.params;
    try {
      const bodyProgress = await BodyProgress.findOneAndDelete({ _id: id, userId: req.user.id });
      if (!bodyProgress) {
        return res.status(404).json({ error: 'Body progress not found' });
      }
      res.json({ message: 'Body progress deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // View Body Progress
  router.get('/body-progress', auth, customerOnly, async (req, res) => {
    try {
      const bodyProgress = await BodyProgress.find({ userId: req.user.id }).sort({ date: -1 });
      res.json(bodyProgress);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  module.exports = router;