const mongoose = require('mongoose');

       const membershipSchema = new mongoose.Schema({
         userId: {
           type: mongoose.Schema.Types.ObjectId,
           ref: 'User',
           required: true,
         },
         gymId: {
           type: mongoose.Schema.Types.ObjectId,
           ref: 'Gym',
           required: true,
         },
         startDate: {
           type: Date,
           required: true,
         },
         endDate: {
           type: Date,
           required: true,
         },
         price: {
           type: Number,
           required: true,
         },
         status: {
           type: String,
           enum: ['active', 'expired', 'cancelled'],
           default: 'active',
         },
       }, { timestamps: true });

       module.exports = mongoose.model('Membership', membershipSchema);