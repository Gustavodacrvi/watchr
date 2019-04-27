const mongoose = require('mongoose');
const bcrypt = require('./bcrypt');

const userSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

const User = module.exports = mongoose.model('User', userSchema);

User.createUser = (newUser, callback) => {
  bcrypt.getPasswordHash(newUser.password, (err, hash) => {
    newUser.password = hash;
    newUser.save(callback);
  });
};

User.comparePassword = (candidatePassword, hash, callback) => {
  bcrypt.matchPasswords(candidatePassword, hash, (err, isMatch) => {
    callback(err, isMatch);
  });
};
