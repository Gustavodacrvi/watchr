let express = require('express')
let router = express.Router()


router.get('/login', (req, res) => {
  res.render('login')
})


module.exports = router
