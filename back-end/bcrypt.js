const bcrypt = require('bcryptjs');

module.exports.getPasswordHash = (password, callback) => {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      callback(err, hash);
    })
  });
};
