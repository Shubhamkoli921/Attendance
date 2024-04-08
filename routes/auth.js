const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const keys = require('../config/keys');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

router.post('/signup', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, role });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, keys.JWT_SECRET);
    res.status(200).json({ token: token,user:user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/additional-details', auth, async (req, res) => {
  try {
    const { courseName, year, userId } = req.body;

    // Check if userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId format' });
    }

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user is not a student
    if (user.role !== 'student') {
      return res.status(403).json({ message: 'Only students are allowed to submit additional details' });
    }

    // Check if additional details are already submitted
    if (user.additionalDetailsSubmitted) {
      return res.status(400).json({ message: 'Additional details already submitted' });
    }

    // Update the user document with additional details
    await User.updateOne(
      { _id: userId },
      { $set: { courseName, year, additionalDetailsSubmitted: true } }
    );

    res.status(200).json({ message: 'Additional details submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



module.exports = router;
