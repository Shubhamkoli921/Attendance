const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['teacher', 'student'], required: true },
  courseName: { type: String }, // Additional field for course name
  year: { type: Number }, // Additional field for year
  additionalDetailsSubmitted: { type: Boolean, default: false } // Flag to track if additional details are submitted
});

module.exports = mongoose.model('User', userSchema);
