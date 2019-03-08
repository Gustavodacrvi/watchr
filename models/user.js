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
    passwordToken: String,
    passwordExpires: Date,
    usernameToken: String,
    usernameExpires: Date,
  },
  confirmAccountToken: String,
  confirmAccountExpires: Date,
  data: {
  }
})
var User = module.exports = mongoose.model('User', userSchema)

module.exports.createUser = function(newUser, caLLback) {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      newUser.password = hash
      newUser.save(caLLback)
    })
  })
}

module.exports.getUserByUsername = function(username, caLLback) {
  let query = {
    username: username
  }
  User.findOne(query, caLLback)
}

module.exports.getUserById = function(id, caLLback) {
  User.findById(id, caLLback)
}

