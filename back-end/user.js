const Model = require('./mongodbModel');
const Bcrypt = require('./bcrypt');
const Token = require('./tokens');

const User = module.exports;



User.checkIfUsernameIsTaken = (username, callback) => {
  Model.findOne({ username: username.trim() }, (err, doc) => {
    if (doc) {
      callback(true);
    } else {
      callback(false);
    }
  });
};

User.checkIfEmailIsTaken = (email, callback) => {
  Model.findOne({ email: email.trim() }, (err, doc) => {
    if (doc) {
      callback(true);
    } else {
      callback(false);
    }
  });
};

User.createUser = (user, callback) => {
  let newUser = new Model(user); 
  newUser.save(callback);
};

User.getUserByUsername = (username, callback) => {
  Model.findOne({ username: username.trim() }, (err, doc) => {
    if (doc === null) {
      callback(false);
    } else {
      callback(doc);
    }
  });
};

User.comparePassword = (candidatePassword, hash, callback) => {
  Bcrypt.matchPasswords(candidatePassword, hash, (err, isMatch) => {
    callback(isMatch);
  });
};

User.dateExpired = (expireDate) => {
  if (Date.now() > expireDate) {
    return true;
  }
  return false;
};

User.getUserByToken = (token, callback) => {
  Model.findOne({ sessionToken: token }, (err, doc) => {
    if (doc === null) {
      callback(false);
    } else {
      callback(doc);
    }
  });
};
