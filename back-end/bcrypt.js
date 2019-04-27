const bcrypt = require('bcryptjs');

module.exports.getPasswordHash = (password, callback) => {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      callback(err, hash);
    })
  });
};

module.exports.matchPasswords = (password, hash, callback) => {
  bcrypt.compare(password, hash, (err, isMatch) => {
    callback(err, isMatch);
  });
};
