let express = require('express')
let router = express.Router()


function handleError(err) {
  console.log(err)
}


let User = require('../models/user')


router.get('/authenticated', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(JSON.stringify({ isAuthenticated: true, username: req.user.username, confirmed: !req.user.accountNotConfirmed }))
  } else {
    if (req.user === undefined) {
      res.send(JSON.stringify({ isAuthenticated: false }))
    } else {
      let confirmedAccount = true
      if (req.user.accountNotConfirmed) {
        confirmedAccount = false
      }
      res.send(JSON.stringify({ isAuthenticated: false, username: undefined, confirmed: confirmedAccount }))
    }
  }
})


module.exports = router
