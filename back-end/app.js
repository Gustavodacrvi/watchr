const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

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



const User = require('./user');
const Token = require('./tokens');

const SESSION_EXPIRE_DATE = 2419200000; // 28 days

app.post('/signup', (req, res) => {
  User.checkIfUsernameIsTaken(req.body.username, (taken) => {
    if (taken) {
      res.send({ error: 'usernameTaken' },);
    } else {
      User.checkIfEmailIsTaken(req.body.email, (taken) => {
        if (taken) {
          res.send({ error: 'emailTaken' },);
        } else {
          Bcrypt.getPasswordHash(user.password, (hash) => {
            Token.createToken((token) => {
              User.createUser({
                username: req.body.username.trim(),
                email: req.body.email.trim(),
                password: hash,
                sessionToken: token,
                sessionTokenExpireDate: Date.now() + SESSION_EXPIRE_DATE,
              }, () => {
                res.send({ error: '' },);
              });
            });
          });
        }
      });
    }
  });
});

app.post('/login', (req, res) => {
  User.getUserByUsername(req.body.username, (doc) => {
    if (!doc) {
      res.send({ error: 'usernameNotFound' },);
    } else {
      User.comparePassword(req.body.password, doc.password, (isMatch) => {
        if (!isMatch) {
          res.send({ error: 'wrongPassword' },);
        } else {
          if (User.dateExpired(doc.sessionTokenExpireDate)) {
            Token.createToken
          }
        }
      });
    }
  });



  User.findOne({ username: req.body.username.trim() }, (err, doc) => {
    if (doc === null) {
      res.send({ error: 'usernameNotFound' },);
    } else {
      User.comparePassword(req.body.password, doc.password, (err, isMatch) => {
        if (!isMatch) {
          res.send({ error: 'wrongPassword' },);
        } else {
          if (Token.dateExpired(doc.sessionTokenExpireDate)) {
            User.createToken((token) => {
              res.send({ error: '', user: {
                username: doc.username,
                email: doc.email,
              }, sessionToken: token});

              doc.sessionToken = token;
              doc.sessionTokenExpireDate = Date.now() + SESSION_EXPIRE_DATE;
              doc.markModified('sessionToken');
              doc.markModified('sessionTokenExpireDate');
              doc.save();
            });
          }
          res.send({ error: '', user: {
            username: doc.username,
            email: doc.email,
          }, sessionToken: doc.sessionToken});
        }
      });
    }
  });
});



app.listen(3000);
