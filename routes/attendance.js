const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Class = require('../models/class');
const Attendance = require('../models/attendance');
const User = require('../models/users');

router.post('/mark', auth, async (req, res) => {
  try {
    const { classId, status } = req.body;
    const selectedClass = await Class.findById(classId);

    if (!selectedClass || !selectedClass.active || selectedClass.endTime < new Date()) {
      return res.status(400).json({ message: 'Class not found, inactive, or expired' });
    }

    const newAttendance = new Attendance({
      student: req.user.userId,
      class: classId,
      status
    });
    await newAttendance.save();
    res.status(201).json({ message: 'Attendance marked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/attendance-list/:classId', auth, async (req, res) => {
  try {
    const classId = req.params.classId;

    // Find attendance records for the given class
    const attendanceRecords = await Attendance.find({ class: classId }).populate('student', 'username');

    // Extract student usernames from the attendance records
    const studentNames = attendanceRecords.map(record => record.student.username);

    // Count the number of unique students
    const uniqueStudentNames = [...new Set(studentNames)];
    const attendanceCount = uniqueStudentNames.length;

    res.status(200).json({ attendanceCount, studentNames: uniqueStudentNames });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Implement other routes for attendance management

module.exports = router;
