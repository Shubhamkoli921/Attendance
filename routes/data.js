const express = require("express");
const router = express.Router();
const Attendance = require("../models/attendance");
const auth = require("../middleware/auth");
// const mongoose = require("mongoose");
const Class = require("../models/class");

router.get('/attendance/:classId', auth, async (req, res) => {
    try {
      const classId = req.params.classId;
  
      // Find the class by ID
      const classInfo = await Class.findById(classId).populate('attendance.student', 'name');
      if (!classInfo) {
        return res.status(404).json({ message: 'Class not found' });
      }
  
      // Extract attendance details
      const attendanceRecords = classInfo.attendance;
  
      // Get the count of attendance records
      const attendanceCount = attendanceRecords.length;
  
      // Extract the names, status, and current timestamp of students who attended the class
      const studentDetails = attendanceRecords.map(record => ({
        name: record.student.name,
        status: record.status,
        timestamp: record.timestamp
      }));
  
      res.status(200).json({ attendanceCount, studentDetails });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

  router.get('/attended-classes', auth, async (req, res) => {
    try {
      const studentId = req.user.userId;
  
      // Find attendance records for the student
      const attendanceRecords = await Attendance.find({ student: studentId }).populate('class');
  
      // Extract class details from attendance records
      const attendedClasses = attendanceRecords.map(record => ({
        className: record.class.name,
        courseName: record.class.courseName,
        year: record.class.year
      }));
  
      res.status(200).json({ attendedClasses });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  
  module.exports = router