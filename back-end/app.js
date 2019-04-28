const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');

const mongoose = require('mongoose');

const app = express();



mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
});
const connection = mongoose.connection;

const corsOptions = {
  origin: 'http://localhost:8080',
};
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false, }));



const User = require('./mongodbModel');


app.post('/signup', (req, res) => {
  User.findOne({ username: req.body.username.trim() }, (err, doc) => {
    if (doc) {
      res.send({ error: 'usernameTaken' },);
    } else {
      User.findOne({ email: req.body.email.trim() }, (err, doc) => {
        if (doc) {
          res.send({ error: 'emailTaken' },);
        } else {
          crypto.randomBytes(20, (err, buf) => {
            const token = buf.toString('hex');
            User.createUser(new User({
              username: req.body.username.trim(),
              email: req.body.email.trim(),
              password: req.body.password.trim(),
              sessionToken: token,
              sessionTokenExpireDate: Date.now() + 2419200000, // 28 days
            }), () => {
              res.send({ error: '' },);
            });
          });
        }
      });
    }
  });
});

app.post('/login', (req, res) => {
  User.findOne({ username: req.body.username.trim() }, (err, doc) => {
    if (doc === null) {
      res.send({ error: 'usernameNotFound' },);
    } else {
      User.comparePassword(req.body.password, doc.password, (err, isMatch) => {
        if (!isMatch) {
          res.send({ error: 'wrongPassword' },);
        } else {
          res.send({ error: '', user: {
            username: doc.username,
            email: doc.email,
          }, sessionToken: token});
        }
      });
    }
  });
});



app.listen(3000);
