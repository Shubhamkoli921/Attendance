const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const keys = require('./config/keys');

// Enable CORS
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb+srv://rohitvsawant1:sBvcqWbXUYqvAct2@srattendance.lbo29el.mongodb.net/?retryWrites=true&w=majority&appName=SRAttendance')
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Database Error:", err);
  });

// Middleware to parse JSON bodies
app.use(express.json());

// Default route
app.get('/', (req, res) => {
  res.send('Hello');
});


//declaration
const authRoutes = require('./routes/auth');
const classRoutes = require('./routes/classes');
const attendanceRoutes = require('./routes/attendance');
const formfilled = require('./routes/formfilled')

// routes 
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/form',formfilled)



// Start the server
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// eX3GkAt39Ka7bkgO