const express = require('express');
     const router = express.Router();
     const auth = require('../middleware/auth');
     const User = require('../models/User');
     const WorkoutPlan = require('../models/WorkoutPlan');
     const DietPlan = require('../models/DietPlan');

     // Middleware to restrict to trainer role
     const trainerOnly = (req, res, next) => {
       if (req.user.role !== 'trainer') {
         return res.status(403).json({ error: 'Access denied: Trainers only' });
       }
       next();
     };

     // Create a Workout Plan for a Member
     router.post('/workout-plans', auth, trainerOnly, async (req, res) => {
       const { userId, exercises } = req.body;
       try {
         // Verify trainer's gym
         const trainer = await User.findById(req.user.id);
         if (!trainer.gymId) {
           return res.status(400).json({ error: 'Trainer is not assigned to a gym' });
         }

         // Verify the user is a member of the trainer's gym
         const member = await User.findById(userId);
         if (!member || member.role !== 'customer' || member.gymId?.toString() !== trainer.gymId.toString()) {
           return res.status(400).json({ error: 'User is not a member of your gym' });
         }

         // Check if a workout plan already exists for the member
         let workoutPlan = await WorkoutPlan.findOne({ userId });
         if (workoutPlan) {
           return res.status(400).json({ error: 'Workout plan already exists for this member' });
         }

         // Create new workout plan
         workoutPlan = new WorkoutPlan({
           userId,
           exercises,
         });
         await workoutPlan.save();

         res.status(201).json(workoutPlan);
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });

     // Update a Workout Plan
     router.put('/workout-plans/:userId', auth, trainerOnly, async (req, res) => {
       const { exercises } = req.body;
       try {
         const trainer = await User.findById(req.user.id);
         if (!trainer.gymId) {
           return res.status(400).json({ error: 'Trainer is not assigned to a gym' });
         }

         const member = await User.findById(req.params.userId);
         if (!member || member.role !== 'customer' || member.gymId?.toString() !== trainer.gymId.toString()) {
           return res.status(400).json({ error: 'User is not a member of your gym' });
         }

         const workoutPlan = await WorkoutPlan.findOneAndUpdate(
           { userId: req.params.userId },
           { exercises },
           { new: true }
         );
         if (!workoutPlan) {
           return res.status(404).json({ error: 'Workout plan not found' });
         }

         res.json(workoutPlan);
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });

     // Delete a Workout Plan
     router.delete('/workout-plans/:userId', auth, trainerOnly, async (req, res) => {
       try {
         const trainer = await User.findById(req.user.id);
         if (!trainer.gymId) {
           return res.status(400).json({ error: 'Trainer is not assigned to a gym' });
         }

         const member = await User.findById(req.params.userId);
         if (!member || member.role !== 'customer' || member.gymId?.toString() !== trainer.gymId.toString()) {
           return res.status(400).json({ error: 'User is not a member of your gym' });
         }

         const workoutPlan = await WorkoutPlan.findOneAndDelete({ userId: req.params.userId });
         if (!workoutPlan) {
           return res.status(404).json({ error: 'Workout plan not found' });
         }

         res.json({ message: 'Workout plan deleted' });
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });

     // Create a Diet Plan for a Member
     router.post('/diet-plans', auth, trainerOnly, async (req, res) => {
       const { userId, meals } = req.body;
       try {
         const trainer = await User.findById(req.user.id);
         if (!trainer.gymId) {
           return res.status(400).json({ error: 'Trainer is not assigned to a gym' });
         }

         const member = await User.findById(userId);
         if (!member || member.role !== 'customer' || member.gymId?.toString() !== trainer.gymId.toString()) {
           return res.status(400).json({ error: 'User is not a member of your gym' });
         }

         let dietPlan = await DietPlan.findOne({ userId });
         if (dietPlan) {
           return res.status(400).json({ error: 'Diet plan already exists for this member' });
         }

         dietPlan = new DietPlan({
           userId,
           meals,
         });
         await dietPlan.save();

         res.status(201).json(dietPlan);
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });

     // Update a Diet Plan
     router.put('/diet-plans/:userId', auth, trainerOnly, async (req, res) => {
       const { meals } = req.body;
       try {
         const trainer = await User.findById(req.user.id);
         if (!trainer.gymId) {
           return res.status(400).json({ error: 'Trainer is not assigned to a gym' });
         }

         const member = await User.findById(req.params.userId);
         if (!member || member.role !== 'customer' || member.gymId?.toString() !== trainer.gymId.toString()) {
           return res.status(400).json({ error: 'User is not a member of your gym' });
         }

         const dietPlan = await DietPlan.findOneAndUpdate(
           { userId: req.params.userId },
           { meals },
           { new: true }
         );
         if (!dietPlan) {
           return res.status(404).json({ error: 'Diet plan not found' });
         }

         res.json(dietPlan);
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });

     // Delete a Diet Plan
     router.delete('/diet-plans/:userId', auth, trainerOnly, async (req, res) => {
       try {
         const trainer = await User.findById(req.user.id);
         if (!trainer.gymId) {
           return res.status(400).json({ error: 'Trainer is not assigned to a gym' });
         }

         const member = await User.findById(req.params.userId);
         if (!member || member.role !== 'customer' || member.gymId?.toString() !== trainer.gymId.toString()) {
           return res.status(400).json({ error: 'User is not a member of your gym' });
         }

         const dietPlan = await DietPlan.findOneAndDelete({ userId: req.params.userId });
         if (!dietPlan) {
           return res.status(404).json({ error: 'Diet plan not found' });
         }

         res.json({ message: 'Diet plan deleted' });
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });

     // Get All Members in Trainer's Gym (for assigning plans)
     router.get('/members', auth, trainerOnly, async (req, res) => {
       try {
         const trainer = await User.findById(req.user.id);
         if (!trainer.gymId) {
           return res.status(400).json({ error: 'Trainer is not assigned to a gym' });
         }

         const members = await User.find({ gymId: trainer.gymId, role: 'customer' }).select('name email');
         res.json(members);
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });

     module.exports = router;