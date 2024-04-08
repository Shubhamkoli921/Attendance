// Update Class Model
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const classSchema = new Schema({
  name: { type: String, required: true },
  courseName: { type: String, required: true },
  year: { type: Number, required: true },
  teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  attendance: [{ type: Schema.Types.ObjectId, ref: 'User' }] // Array of student IDs who marked attendance
});

module.exports = mongoose.model('Class', classSchema);
