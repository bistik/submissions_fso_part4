const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user'); // Assuming you have a User model defined

const usersRouter = express.Router();

usersRouter.post('/', async (req, res) => {
  const { username, name, password } = req.body;

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const newUser = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await newUser.save();
  res.status(201).json(savedUser);
});

usersRouter.get('/', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = usersRouter;