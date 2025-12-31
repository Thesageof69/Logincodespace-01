require('dotenv').config();
require('./config/database').connect();

const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const csvPath = path.join(__dirname, 'users.csv');

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

function appendUserToCSV(user) {
  const line = `\n${user._id},${user.FirstName},${user.LastName},${user.Email}`;
  if (!fs.existsSync(csvPath)) {
    const header = 'id,FirstName,LastName,Email';
    fs.writeFileSync(csvPath, header + line, 'utf8');
  } else {
    fs.appendFileSync(csvPath, line, 'utf8');
  }
}

function auth(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send('Access denied. No token.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(401).send('Invalid or expired token.');
  }
}

app.get('/', (req, res) => {
  res.send('<h1>Server is working</h1>');
});

app.post('/register', async (req, res) => {
  try {
    const { FirstName, LastName, Email, Password } = req.body;

    if (!(FirstName && LastName && Email && Password)) {
      return res.status(400).send('All input is required');
    }

    const existingUser = await User.findOne({ Email });
    if (existingUser) {
      return res.status(409).send('User already exists');
    }

    const encryptPass = await bcrypt.hash(Password, 10);

    const user = await User.create({
      FirstName,
      LastName,
      Email,
      Password: encryptPass,
    });

    const token = jwt.sign(
      { id: user._id, Email: user.Email },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    user.token = token;
    await user.save();

    appendUserToCSV(user);

    user.Password = undefined;

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Server error');
  }
});


app.post('/login', async (req, res) => {
  try {
    const { Email, Password } = req.body;

    if (!(Email && Password)) {
      return res.status(400).send('Send all data');
    }

    const user = await User.findOne({ Email });
    if (!user) {
      return res.status(400).send('User not found');
    }

    const passwordMatch = await bcrypt.compare(Password, user.Password);
    if (!passwordMatch) {
      return res.status(401).send('Invalid credentials');
    }

    const token = jwt.sign(
      { id: user._id, Email: user.Email },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    user.token = token;
    await user.save();

    user.Password = undefined;

    const option = {
      expires: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    return res
      .status(200)
      .cookie('token', token, option)
      .json({
        success: true,
        message: 'User logged in successfully',
        user,
      });
  } catch (err) {
    console.log(err);
    res.status(500).send('Server error');
  }
});

app.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-Password');
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).send('Server error');
  }
});


app.put('/profile', auth, async (req, res) => {
  try {
    const { FirstName, LastName, Email, Password } = req.body;

    const updateData = {};
    if (FirstName) updateData.FirstName = FirstName;
    if (LastName) updateData.LastName = LastName;
    if (Email) updateData.Email = Email;
    if (Password) {
      updateData.Password = await bcrypt.hash(Password, 10);
    }

    let user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-Password');

    if (!user) {
      return res.status(404).send('User not found');
    }

    
    let token = req.cookies.token;
    if (Email) {
      token = jwt.sign(
        { id: user._id, Email: user.Email },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );
      res.cookie('token', token, {
        expires: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated',
      user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Server error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
