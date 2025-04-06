const mongoose = require('mongoose');

  const macroLogSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    food: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true,
    },
    protein: {
      type: Number,
      required: true,
    },
    carbs: {
      type: Number,
      required: true,
    },
    fats: {
      type: Number,
      required: true,
    },
    calories: {
      type: Number,
      required: true,
    },
  }, {
    timestamps: true,
  });

  module.exports = mongoose.model('MacroLog', macroLogSchema);