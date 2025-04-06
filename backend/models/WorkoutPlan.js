const mongoose = require('mongoose');

       const workoutPlanSchema = new mongoose.Schema({
         userId: {
           type: mongoose.Schema.Types.ObjectId,
           ref: 'User',
           required: true,
         },
         exercises: [{
           name: String,
           sets: Number,
           reps: Number,
           rest: String,
           day: String,
         }],
       }, { timestamps: true });

       module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);