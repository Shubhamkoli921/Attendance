const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Class = require("../models/class");
const User = require("../models/users");
const Attendance = require("../models/attendance");
const mongoose = require("mongoose");

router.post("/create", auth, async (req, res) => {
  try {
    const { name, courseName, year } = req.body;

    // Find the teacher (user) who is creating the class
    const teacher = await User.findById(req.user.userId);

    // Check if the user is a teacher
    if (teacher.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Only teachers are allowed to create classes" });
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
      endTime: expirationTime,
      // active: true // Assuming class is active when created
    });
    await newClass.save();
    res.status(201).json({ newClass, message: "Class created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/studentclasseslist", auth, async (req, res) => {
  try {
    // Find the student user
    const student = await User.findById(req.user.userId);

    // Check if the user is a student
    if (student.role !== "student") {
      return res
        .status(403)
        .json({ message: "Only students are allowed to access their classes" });
    }

    // Extract courseName from the student's details
    const { courseName } = student;

    // Fetch classes with the same courseName
    const similarClasses = await Class.find({ courseName });

    res.status(200).json({ similarClasses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const teacherId = req.query.teacherId; // Extract teacherId from query parameters

    // Fetch classes taught by the specified teacher
    const classes = await Class.find({ teacher: teacherId });

    res.status(200).json({ classes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/markattendance", auth, async (req, res) => {
  try {
    const { classId, status } = req.body;
    const studentId = req.user.userId;

    // Find the class by ID
    const classInfo = await Class.findById(classId);
    if (!classInfo) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Check if the provided classId matches the class created course name and year
    if (
      classInfo.courseName !== req.body.courseName ||
      classInfo.year !== req.body.year
    ) {
      return res
        .status(400)
        .json({ message: "Course name or year does not match with the class" });
    }

    // Check if the class is currently active (within its start and end time)
    const currentTime = new Date();
    if (currentTime < classInfo.startTime || currentTime > classInfo.endTime) {
      return res.status(403).json({ message: "Class is not currently active" });
    }

    // Check if the status is valid
    if (status !== "present" && status !== "absent") {
      return res.status(400).json({ message: "Invalid attendance status" });
    }

    // Fetch the student's information
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Update Class collection with student's attendance including status, timestamp, and name
    classInfo.attendance.push({
      student: studentId,
      studentName: student.name, // Include student's name
      status,
      timestamp: currentTime,
    });
    await classInfo.save();

    // Save attendance details in Attendance collection
    const attendanceRecord = new Attendance({
      student: studentId,
      class: classId,
      studentName: student.name,
      status,
      timestamp: currentTime,
    });
    await attendanceRecord.save();

    res.status(200).json({
      message: "Attendance marked successfully",
      studentName: student.name,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// Mark Attendance Endpoint (for students)

module.exports = router;
