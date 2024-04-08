const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/users');

// Route to fill the form for one time only
router.post('/fill-form', auth, async (req, res) => {
  try {
    const { subject, year, courseName } = req.body;
    const userId = req.user.userId;

    // Find the user in the database
    const user = await User.findById(userId);

    // Check if the user exists and if the user is a student
    if (!user || user.role !== 'student') {
      return res.status(400).json({ message: 'User not found or not a student' });
    }

    // Check if the form is already filled
    if (user.formFilled) {
      return res.status(400).json({ message: 'Form already filled' });
    }

    // Update the user's information with the filled form data
    await User.findByIdAndUpdate(userId, { subject, year, courseName, formFilled: true });

    res.status(200).json({ message: 'Form submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
