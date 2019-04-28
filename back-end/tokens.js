const crypto = require('crypto');

const Token = module.exports;

Token.createToken = (callback) => {
  crypto.randomBytes(20, (err, buf) => {
    const token = buf.toString('hex');
    callback(token);
  });
};
