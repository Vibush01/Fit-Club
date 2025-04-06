const mongoose = require('mongoose');

  const workoutPlanSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    exercises: [
      {
        name: {
          type: String,
          required: true,
        },
        sets: {
          type: Number,
          required: true,
        },
        reps: {
          type: String,
          required: true,
        },
        rest: {
          type: String,
          required: true,
        },
        day: {
          type: String,
          required: true,
        },
      },
    ],
  }, { timestamps: true });

  module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);