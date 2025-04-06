const mongoose = require('mongoose');

       const userSchema = new mongoose.Schema({
         email: {
           type: String,
           required: true,
           unique: true,
         },
         password: {
           type: String,
           required: true,
         },
         role: {
           type: String,
           enum: ['admin', 'owner', 'trainer', 'customer'],
           required: true,
         },
         gymId: {
           type: mongoose.Schema.Types.ObjectId,
           ref: 'Gym',
         },
         name: {
           type: String,
           required: true,
         },
       }, { timestamps: true });

       module.exports = mongoose.model('User', userSchema);