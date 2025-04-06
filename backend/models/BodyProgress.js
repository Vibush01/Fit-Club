const mongoose = require('mongoose');

  const bodyProgressSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    bodyFat: {
      type: Number,
      required: true,
    },
    muscleMass: {
      type: Number,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    measurements: {
      chest: Number,
      waist: Number,
      hips: Number,
    },
  }, { timestamps: true });

  module.exports = mongoose.model('BodyProgress', bodyProgressSchema);