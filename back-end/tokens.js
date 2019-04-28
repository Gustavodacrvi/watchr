const crypto = require('crypto');

module.exports = {
  dateExpired = (expireDate) => {
    if (Date.now() > expireDate) {
      return true;
    }
    return false;
  },
  createToken = (callback) => {
    crypto.randomBytes(20, (err, buf) => {
      const token = buf.toString('hex');
      callback(token);
    });
  },
};
