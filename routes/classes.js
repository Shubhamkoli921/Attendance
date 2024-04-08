const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Class = require('../models/class');
const User = require('../models/users');

router.post('/create', auth, async (req, res) => {
  try {
    const { name, courseName, year } = req.body;

    // Find the teacher (user) who is creating the class
    const teacher = await User.findById(req.user.userId);

    // Check if the user is a teacher
    if (teacher.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers are allowed to create classes' });
    }

    // Create a new class with the provided details
    const currentTime = new Date();
    const expirationTime = new Date(currentTime);
    expirationTime.setHours(expirationTime.getHours() + 1); // Expires after 1 hour

    const newClass = new Class({
      name,
      courseName,
      year,
      teacher: req.user.userId,
      startTime: currentTime,
      endTime: expirationTime
      // active: true // Assuming class is active when created
    });
    await newClass.save();
    res.status(201).json({ newClass, message: 'Class created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/studentclasseslist', auth, async (req, res) => {
  try {
    // Find the student user
    const student = await User.findById(req.user.userId);

    // Check if the user is a student
    if (student.role !== 'student') {
      return res.status(403).json({ message: 'Only students are allowed to access their classes' });
    }

    // Extract courseName from the student's details
    const { courseName } = student;

    // Fetch classes with the same courseName
    const similarClasses = await Class.find({ courseName });

    res.status(200).json({ similarClasses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const teacherId = req.query.teacherId; // Extract teacherId from query parameters

    // Fetch classes taught by the specified teacher
    const classes = await Class.find({ teacher: teacherId });

    res.status(200).json({ classes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Mark Attendance Endpoint (for students)
router.post('/:classId/attendance', auth, async (req, res) => {
  try {
    const classId = req.params.classId;
    const studentId = req.user.userId;

    // Find the class
    const classObj = await Class.findById(classId);

    // Check if the class exists
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Mark attendance if the student is part of the class
    if (classObj.attendance.includes(studentId)) {
      return res.status(400).json({ message: 'Attendance already marked' });
    }

    // Add student ID to attendance array
    classObj.attendance.push(studentId);
    await classObj.save();

    res.status(200).json({ message: 'Attendance marked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});//changes marayche ahet aaplyala course name and years ani class id


// Retrieve Attendance Information Endpoint
router.get('/:classId/attendance', auth, async (req, res) => {
  try {
    const classId = req.params.classId;

    // Find the class
    const classObj = await Class.findById(classId);

    // Check if the class exists
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Count the number of students who marked attendance
    const attendanceCount = classObj.attendance.length;

    res.status(200).json({ attendanceCount, classObj });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
