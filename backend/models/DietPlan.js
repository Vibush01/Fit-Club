const mongoose = require('mongoose');

       const dietPlanSchema = new mongoose.Schema({
         userId: {
           type: mongoose.Schema.Types.ObjectId,
           ref: 'User',
           required: true,
         },
         meals: [{
           mealName: String,
           calories: Number,
           macros: {
             protein: Number,
             carbs: Number,
             fats: Number,
           },
           time: String,
         }],
       }, { timestamps: true });

       module.exports = mongoose.model('DietPlan', dietPlanSchema);