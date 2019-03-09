let express = require('express')
let router = express.Router()


function handleError(err) {
  console.log(err)
}


let User = require('../models/user')





module.exports = router
