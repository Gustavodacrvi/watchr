const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

var userSchema = mongoose.Schema({
  username: {
    type: String,
    required: !0,
  },
  email: {
    type: String,
    required: !0,
  },
  password: {
    type: String,
    required: !0,
    unique: !0
  },
  reset: {
    password: {
      token: String,
      expires: Date,
    },
    username: {
      token: String,
      expires: Date,
    },
  },
  accountNotConfirmed: Boolean,
  accountConfirmationToken: String,
  accountConfirmationExpires: Date,
  data: {
  }
})
var User = module.exports = mongoose.model('User', userSchema)

module.exports.createUser = function(newUser, callBack) {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      newUser.password = hash
      newUser.save(callBack)
    })
  })
}

module.exports.comparePassword = function(candidatePassword, hash, callBack) {
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    if (err) throw err
    callBack(null, isMatch)
  })
}

module.exports.getUserByUsername = function(username, callBack) {
  User.findOne({ username: username }, callBack)
}

module.exports.getUserByEmail = function(email, callBack) {
  User.findOne({ email: email}, callBack)
}

module.exports.getUserById = function(id, callBack) {
  User.findById(id, callBack)
}
