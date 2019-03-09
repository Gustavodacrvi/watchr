let express = require('express')
let router = express.Router()
let crypto = require('crypto')
let passport = require('passport')
let LocalStrategy = require('passport-local').Strategy
let CronJob = require('cron').CronJob
let async = require('async')
let nodemailer = require('nodemailer')


function handleError(err) {
  console.log(err)
}


let User = require('../models/user')

function getToken(callback) {
  crypto.randomBytes(20, function(err, buf) {
    let token = buf.toString('hex')
    callback(token)
  })
}

router.get('/login', (req, res) => {
  res.render('login')
})

router.get('/signup', (req, res) => {
  res.render('signup')
})

router.post('/signup', (req, res) => {
  let b = req.body

  User.getUserByUsername(b.username, (err, user) => {
    if (err) return handleError(err)
    if (user !== null) {
      res.send(JSON.stringify({ valid: false, error: 'Username taken.', inputName: 'username' }))
    } else {
      User.getUserByEmail(b.email, (err, user) => {
        if (err) return handleError(err)
        if (user !== null) {
          res.send(JSON.stringify({ valid: false, error: 'Email taken.', inputName: 'email' }))
        } else {
          getToken((token) => {
            

            let user = new User({
              username: b.username,
              email: b.email,
              password: b.password,
              accountConfirmationConfirmed: false,
              accountConfirmationToken: token,
              accountConfirmationExpires: Date.now() + 604800000, // 7 days : 604800000
            })
            User.createUser(user, (err) => {
              if (err) return handleError(err)
  
              async.waterfall([function(done) {
                var smtpTransport = nodemailer.createTransport({
                  service: 'gmail',
                  auth: {
                    type: 'OAuth2',
                    user: 'gettingthingsdoneforfree@gmail.com',
                    clientId: '419231519910-ud5h7i6vlppum2htb8dphsapjnqe1t87.apps.googleusercontent.com',
                    clientSecret: process.env.CSECRET,
                    refreshToken: '1/LLDNO2am9KrK1KACOHlnjq5SsSx1XI47E5JYsRRQIT8',
                    accessToken: 'ya29.GluyBq6s7HtZagS2FknhmE1TxsiFWbqxF8_cx_W-GonYDsxUxPFUxh0ofm-oz4AXoh99W8c3EWkHQ3cSZBUAM0dcj0g5_S6IxGyJ0N1oJDZhcnIf35jWgyJHmcIi'
                  }
                });
                var mailOptions = {
                  to: b.email,
                  from: 'gettingthingsdoneforfree@gmail.com',
                  subject: 'Getting Things Done for Free(GTDF) confirm account',
                  text: "You are receiving this because you (or someone else) created an account on INSERT LINK HERE LATTER,.\n\n" + 'Please click on the following link, or paste this into your browser to confirm your account:\n\n' + 'http://' + req.headers.host + '/confirm-password/' + token + '\n\n' + "Your GTDF account will be deleted 7 days after its creation if not confirmed.\n"
                };
                smtpTransport.sendMail(mailOptions, function(err) {
                  if (err) {
                    handleError(err)
                    res.send(JSON.stringify({ valid: false, inputName: 'email', error: 'Invalid email.' }))
                    User.deleteOne({ username: b.username }, (err) => {
                      if (err) return handleError(err)
                    })
                  } else {
                    req.flash('success', 'You created an account and can now log in.')
                    res.send(JSON.stringify({ valid: true, error: null, inputName: null }))
                  }
                })
              }], function(err) {
                if (err) return next(err);
                User.deleteOne({ username: b.username }, (err) => {
                  if (err) return handleError(err)
                })
              })
            })
          })
        }
      })
    }
  })
})

router.get('/confirm-password/:token', (req, res) => {
  User.findOne({ 
    accountConfirmationToken: req.params.token,
    accountConfirmationExpires: {
      $gt: Date.now(),
    },
  }, function(err, user) {
    if (err) return handleError(err)
    if (!user) {
      req.flash('error', 'Confirmation token is invalid or has expired.')
      res.redirect('/login')
    } else {
      user.accountConfirmationConfirmed = undefined
      user.accountConfirmationToken = undefined
      user.accountConfirmationExpires = undefined
      user.markModified('accountConfirmationExpires')
      user.markModified('accountConfirmationToken')
      user.markModified('accountConfirmationConfirmed')
      user.save((err) => {
        if (err) return handleError(err)

        req.flash('success', 'Your account has been confirmed!')
        res.redirect('/login')
      })
    }
  })
})

// RUN EVERY HOUR '0 0 * * * *'
new CronJob('0 0 * * * *', function() {
  User.find({ accountConfirmationConfirmed: false }, (err, docs) => {
    if (err) return handleError(err)

    let length = docs.length
    for (let i =0;i<length;i++) {
      if (new Date(docs[0].accountConfirmationExpires).getTime() < Date.now()) {
        User.deleteOne({ username: docs[i].username }, (err) => {
          if (err) return handleError(err)
        })
      }
    }
  })
}, null, true, 'America/Los_Angeles')

passport.use(new LocalStrategy(function(username, password, done) {
  User.getUserByUsername(username.trim(), function(err, user) {
    if (err) throw err
    if (!user) {
      return done(null, !1, {
        message: 'Unknown username'
      })
    }
    User.comparePassword(password, user.password, function(err, isMatch) {
      if (err) throw err
      if (isMatch) {
        return done(null, user)
      } else {
        return done(null, !1, {
          message: 'Wrong password'
        })
      }
    })
  })
}))
passport.serializeUser(function(user, done) {
  done(null, user.id)
})
passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user)
  })
})

module.exports = router
