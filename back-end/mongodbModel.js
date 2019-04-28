const mongoose = require('mongoose');
const bcrypt = require('./bcrypt');

const userSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String,
  sessionToken: String,
  sessionTokenExpireDate: Number,
});

module.exports = mongoose.model('User', userSchema);
