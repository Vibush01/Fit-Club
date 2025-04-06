const mongoose = require('mongoose');

       const gymSchema = new mongoose.Schema({
         name: {
           type: String,
           required: true,
         },
         location: {
           type: String,
           required: true,
         },
         ownerId: {
           type: mongoose.Schema.Types.ObjectId,
           ref: 'User',
           required: true,
         },
         trainerIds: [{
           type: mongoose.Schema.Types.ObjectId,
           ref: 'User',
         }],
         memberIds: [{
           type: mongoose.Schema.Types.ObjectId,
           ref: 'User',
         }],
         images: [{
           type: String, // URL or file path for gym images
         }],
       }, { timestamps: true });

       module.exports = mongoose.model('Gym', gymSchema);